using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Purchase.DTOs;
using CompreoBooks.Domain.Entities.Purchase;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Purchase.Commands;

public record CreatePurchaseOrderCommand : IRequest<Guid>
{
    public Guid VendorId { get; set; }
    public DateTime OrderDate { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public string? DeliveryAddress { get; set; }
    public string? PaymentTerms { get; set; }
    public string? ShipmentPreference { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }
    public string? TermsAndConditions { get; set; }
    
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Adjustment { get; set; }
    public decimal TotalAmount { get; set; }

    public int OrderType { get; set; }

    public Guid? PurchaseRequestId { get; set; } // Added PR Link
    public List<CreatePurchaseOrderItemDto> Items { get; set; } = new();
}

// ... Validator remains same ...

public class CreatePurchaseOrderCommandHandler : IRequestHandler<CreatePurchaseOrderCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreatePurchaseOrderCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreatePurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        // Generate Purchase Order Number
        var count = await _context.PurchaseOrders.CountAsync(cancellationToken) + 1;
        var orderNumber = $"PO-{count:D4}";
        while (await _context.PurchaseOrders.AnyAsync(x => x.OrderNumber == orderNumber, cancellationToken))
        {
            count++;
            orderNumber = $"PO-{count:D4}";
        }

        var entity = new PurchaseOrder
        {
            OrderNumber = orderNumber,
            VendorId = request.VendorId,
            OrderDate = request.OrderDate.ToUniversalTime(),
            ExpectedDeliveryDate = request.ExpectedDeliveryDate?.ToUniversalTime(),
            DeliveryAddress = request.DeliveryAddress ?? string.Empty,
            PaymentTerms = request.PaymentTerms ?? string.Empty,
            ShipmentPreference = request.ShipmentPreference ?? string.Empty,
            Reference = request.Reference ?? string.Empty,
            Notes = request.Notes ?? string.Empty,
            TermsAndConditions = request.TermsAndConditions ?? string.Empty,
            OrderType = (PurchaseOrderType)request.OrderType,
            
            DiscountPercentage = request.DiscountPercentage,
            DiscountAmount = request.DiscountAmount,
            Adjustment = request.Adjustment,

            Status = PurchaseOrderStatus.Draft,
            PurchaseRequestId = request.PurchaseRequestId
        };

        foreach (var itemDto in request.Items)
        {
            var taxAmount = (itemDto.Quantity * itemDto.UnitPrice) * (itemDto.TaxRate / 100);
            var totalAmount = (itemDto.Quantity * itemDto.UnitPrice) + taxAmount;

            entity.Items.Add(new PurchaseOrderItem
            {
                ItemId = itemDto.ItemId,
                Description = itemDto.Description,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice,
                AccountId = itemDto.AccountId,
                TaxId = itemDto.TaxId,
                TaxRate = itemDto.TaxRate,
                TaxAmount = taxAmount,
                TotalAmount = totalAmount,
                ReceivedQuantity = 0
            });
        }
        
        entity.SubTotal = entity.Items.Sum(x => x.Quantity * x.UnitPrice);
        entity.TaxAmount = entity.Items.Sum(x => x.TaxAmount);
        
        // Calculate Total
        // If DiscountAmount is provided, use it. If Percentage is provided, calculate.
        if (entity.DiscountAmount == 0 && entity.DiscountPercentage > 0)
        {
             entity.DiscountAmount = (entity.SubTotal * entity.DiscountPercentage) / 100;
        }

        entity.TotalAmount = entity.SubTotal + entity.TaxAmount + entity.Adjustment - entity.DiscountAmount;

        try
        {
            _context.PurchaseOrders.Add(entity);

            // If linked to a PR, update PR status
            if (request.PurchaseRequestId.HasValue)
            {
                var pr = await _context.PurchaseRequests.FindAsync(new object[] { request.PurchaseRequestId.Value }, cancellationToken);
                if (pr != null)
                {
                    pr.Status = PurchaseRequestStatus.Closed;
                }
            }

            await _context.SaveChangesAsync(cancellationToken);
            return entity.Id;
        }
        catch (Exception ex)
        {
            var logPath = @"C:\TellaWA\Compreo_Books_ERP\server_error_log.txt";
            var message = $"Error: {ex.Message}\nInner: {ex.InnerException?.Message}\nStack: {ex.StackTrace}";
            await System.IO.File.WriteAllTextAsync(logPath, message, cancellationToken);
            throw;
        }
    }
}
