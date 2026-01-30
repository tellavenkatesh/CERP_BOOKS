using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Sales;
using MediatR;
using Microsoft.EntityFrameworkCore;
using CompreoBooks.Application.Features.Sales.DTOs;

namespace CompreoBooks.Application.Features.Sales.Commands;

public class UpdateSalesOrderCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    public CreateSalesOrderDto Data { get; set; }

    public UpdateSalesOrderCommand(Guid id, CreateSalesOrderDto data)
    {
        Id = id;
        Data = data;
    }
}

public class UpdateSalesOrderCommandHandler : IRequestHandler<UpdateSalesOrderCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateSalesOrderCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateSalesOrderCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var so = await _context.SalesOrders
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
            
            // Fetch Company State
            var company = await _context.Companies.FirstOrDefaultAsync(cancellationToken);
            var companyState = company?.State?.Trim().ToUpper();
            var placeOfSupply = request.Data.PlaceOfSupply?.Trim().ToUpper();

            if (so == null) throw new Exception("Sales Order not found");

            // Update Header
            so.CustomerId = request.Data.CustomerId;
            so.OrderDate = request.Data.OrderDate;
            so.ExpectedDeliveryDate = request.Data.ExpectedDeliveryDate;
            so.CustomerPONumber = request.Data.CustomerPONumber;
            so.DeliveryAddress = request.Data.DeliveryAddress;
            so.PaymentTerms = request.Data.PaymentTerms;
            so.Salesperson = request.Data.Salesperson;
            so.PlaceOfSupply = request.Data.PlaceOfSupply;
            so.ShippingCharges = request.Data.ShippingCharges;
            // ... (keep previous header updates)
            so.TermsAndConditions = request.Data.TermsAndConditions;
            
            // Safer Enum Parsing
            if (Enum.TryParse<OrderType>(request.Data.OrderType, true, out var orderType))
            {
                so.OrderType = orderType;
            }
            else
            {
                so.OrderType = OrderType.Standard; // Default or throw
            }

            // SAVE PARENT FIRST
            await _context.SaveChangesAsync(cancellationToken);

            // Check if any Delivery Challans exist for this SO
            // If yes, we CANNOT delete/re-create items because of FK constraints.
            // We should restrict item editing or handle it via smart update (which requires item IDs).
            // For now, if downstream docs exist, we prevent item modification.
            
            var hasDownstreamDocs = await _context.DeliveryChallans
                .AnyAsync(dc => dc.SalesOrderId == so.Id && dc.Status != DeliveryChallanStatus.Cancelled, cancellationToken);

            if (hasDownstreamDocs)
            {
                // If the user changed items, we have a problem.
                // For now, we will SKIP item update and Log/Warn, or throw?
                // Throwing is better so user knows why.
                // But we need to check if items ACTUALLY changed to avoid annoying errors on header-only edits.
                // Since matching is hard without IDs, we'll just check counts or assume if they hit Save, they might have changed it.
                // Let's being strict:
                 throw new Exception("Cannot modify Sales Order items because Delivery Challans have already been created. Please cancel the challans first.");
            }

            // Update Items (Delete and Re-add)
            await _context.DeleteSalesOrderItemsBySalesOrderIdAsync(so.Id, cancellationToken);

            // Clear in-memory collection to avoid tracking issues
            if (so.Items != null) so.Items.Clear();
            else so.Items = new System.Collections.Generic.List<SalesOrderItem>();

            var totalAmount = 0m;
            decimal totalCgst = 0, totalSgst = 0, totalIgst = 0;

            foreach (var itemDto in request.Data.Items)
            {
                var amount = itemDto.Quantity * itemDto.UnitPrice;
                var taxAmount = amount * (itemDto.TaxRate / 100);
                var itemTotal = amount + taxAmount;
                
                decimal cgst = 0, sgst = 0, igst = 0;
                if (!string.IsNullOrEmpty(companyState) && !string.IsNullOrEmpty(placeOfSupply) && companyState == placeOfSupply)
                {
                    cgst = taxAmount / 2;
                    sgst = taxAmount / 2;
                }
                else
                {
                    igst = taxAmount;
                }

                totalCgst += cgst;
                totalSgst += sgst;
                totalIgst += igst;
                
                // Add directly to DbContext
                _context.SalesOrderItems.Add(new SalesOrderItem
                {
                    SalesOrderId = so.Id,
                    ItemId = itemDto.ItemId,
                    Description = itemDto.Description,
                    Quantity = itemDto.Quantity,
                    UnitPrice = itemDto.UnitPrice,
                    TaxRate = itemDto.TaxRate,
                    TaxAmount = taxAmount,
                    CgstAmount = cgst,
                    SgstAmount = sgst,
                    IgstAmount = igst,
                    TotalAmount = itemTotal
                });
                totalAmount += itemTotal;
            }

            // Update Total on Parent
            so.TotalAmount = totalAmount + so.ShippingCharges + so.Adjustment;
            so.TotalCgstAmount = totalCgst;
            so.TotalSgstAmount = totalSgst;
            so.TotalIgstAmount = totalIgst;


            // Final Save
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] UpdateSalesOrder failed: {ex.Message}");
            throw;
        }
    }
}
