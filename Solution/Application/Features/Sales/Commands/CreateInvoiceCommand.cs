using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Sales.DTOs;
using CompreoBooks.Domain.Entities.Sales;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Commands;


public class CreateInvoiceDto
{
    public Guid CustomerId { get; set; }
    public Guid? SalesOrderId { get; set; }
    public Guid? DeliveryChallanId { get; set; }
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }
    
    public string? ReferenceNumber { get; set; }
    public string? PlaceOfSupply { get; set; }
    // ...
    public string? PaymentTerms { get; set; }
    public string? Salesperson { get; set; }
    public string? CustomerNotes { get; set; }
    public string? TermsAndConditions { get; set; }

    public decimal ShippingCharges { get; set; }
    public decimal Adjustment { get; set; }
    public decimal RoundOff { get; set; }

    public List<CreateInvoiceLineDto> Items { get; set; } = new();
}

public class CreateInvoiceLineDto
{
    public Guid ItemId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public decimal TaxRate { get; set; }
    
    public Guid? SalesOrderItemId { get; set; }
    public Guid? DeliveryChallanLineId { get; set; }
}

public record CreateInvoiceCommand(CreateInvoiceDto Dto) : IRequest<Guid>;

public class CreateInvoiceCommandValidator : AbstractValidator<CreateInvoiceCommand>
{
    public CreateInvoiceCommandValidator()
    {
        RuleFor(v => v.Dto.CustomerId).NotEmpty();
        RuleFor(v => v.Dto.InvoiceDate).NotEmpty();
        RuleFor(v => v.Dto.Items).NotEmpty();
    }
}

public class CreateInvoiceCommandHandler : IRequestHandler<CreateInvoiceCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ISender _sender;

    public CreateInvoiceCommandHandler(IApplicationDbContext context, ISender sender)
    {
        _context = context;
        _sender = sender;
    }

    public async Task<Guid> Handle(CreateInvoiceCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        // Generate Invoice Number
        var count = await _context.Invoices.CountAsync(cancellationToken);
        var invoiceNumber = $"INV-{(count + 1):D4}";

        // Fetch Company State
        var company = await _context.Companies.FirstOrDefaultAsync(cancellationToken);
        var companyState = company?.State?.Trim().ToUpper();
        var placeOfSupply = dto.PlaceOfSupply?.Trim().ToUpper();

        var entity = new Invoice
        {
            InvoiceNumber = invoiceNumber,
            CustomerId = dto.CustomerId,
            SalesOrderId = dto.SalesOrderId,
            DeliveryChallanId = dto.DeliveryChallanId,
            InvoiceDate = dto.InvoiceDate,
            DueDate = dto.DueDate,
            ReferenceNumber = dto.ReferenceNumber,
            PlaceOfSupply = dto.PlaceOfSupply,
            PaymentTerms = dto.PaymentTerms,
            Salesperson = dto.Salesperson,
            CustomerNotes = dto.CustomerNotes,
            TermsAndConditions = dto.TermsAndConditions,
            ShippingCharges = dto.ShippingCharges,
            Adjustment = dto.Adjustment,
            RoundOff = dto.RoundOff,
            Status = InvoiceStatus.Draft
        };

        foreach (var itemDto in dto.Items)
        {
            var taxAmount = (itemDto.Quantity * itemDto.Rate) * (itemDto.TaxRate / 100);
            var amount = (itemDto.Quantity * itemDto.Rate) + taxAmount;

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

            // If linked to SO, update invoiced qty
            if (itemDto.SalesOrderItemId.HasValue)
            {
                var soItem = await _context.SalesOrderItems.FindAsync(new object[] { itemDto.SalesOrderItemId.Value }, cancellationToken);
                if (soItem != null)
                {
                    soItem.QuantityInvoiced += itemDto.Quantity;
                }
            }

            // If linked to DC, update invoiced qty on DC Line
            if (itemDto.DeliveryChallanLineId.HasValue)
            {
                 var dcLine = await _context.DeliveryChallanLines.FindAsync(new object[] { itemDto.DeliveryChallanLineId.Value }, cancellationToken);
                 if (dcLine != null)
                 {
                     dcLine.InvoicedQuantity += itemDto.Quantity;
                 }
            }

            entity.Items.Add(new InvoiceLine
            {
                ItemId = itemDto.ItemId,
                Description = itemDto.Description,
                Quantity = itemDto.Quantity,
                Rate = itemDto.Rate,
                TaxRate = itemDto.TaxRate,
                TaxAmount = taxAmount,
                CgstAmount = cgst,
                SgstAmount = sgst,
                IgstAmount = igst,
                Amount = amount
            });
        }

        entity.SubTotal = entity.Items.Sum(x => x.Quantity * x.Rate);
        entity.TaxAmount = entity.Items.Sum(x => x.TaxAmount);
        entity.TotalCgstAmount = entity.Items.Sum(x => x.CgstAmount);
        entity.TotalSgstAmount = entity.Items.Sum(x => x.SgstAmount);
        entity.TotalIgstAmount = entity.Items.Sum(x => x.IgstAmount);
        
        // Final Total Calculation
        entity.TotalAmount = entity.SubTotal + entity.TaxAmount + entity.ShippingCharges + entity.Adjustment + entity.RoundOff;

        // Update Sales Order Status if linked
        if (dto.SalesOrderId.HasValue)
        {
            var so = await _context.SalesOrders
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.Id == dto.SalesOrderId.Value, cancellationToken);

            if (so != null)
            {
                // Calculate Invoice Status
                var allInvoiced = so.Items.All(i => i.QuantityInvoiced >= i.Quantity);
                var anyInvoiced = so.Items.Any(i => i.QuantityInvoiced > 0);

                if (allInvoiced) so.InvoiceStatus = OrderStatus.FullyInvoiced;
                else if (anyInvoiced) so.InvoiceStatus = OrderStatus.PartiallyInvoiced;
                else so.InvoiceStatus = OrderStatus.Confirmed; // Or Draft

                // Auto-DC Logic
                if (so.OrderType == OrderType.GoodsAutoDC)
                {
                     // Logic handled post-save
                }

                // Service Logic cleanup - ignore delivery status if Service
                if (so.OrderType == OrderType.Service)
                {
                     // Force DeliveryStatus to FullyDelivered so it can Close
                     so.DeliveryStatus = OrderStatus.FullyDelivered;
                }

                // Logic for Overall Status
                if (so.DeliveryStatus == OrderStatus.FullyDelivered && so.InvoiceStatus == OrderStatus.FullyInvoiced)
                    so.Status = OrderStatus.Closed;
                else if (so.InvoiceStatus == OrderStatus.FullyInvoiced)
                    so.Status = OrderStatus.FullyInvoiced;
                else if (so.InvoiceStatus == OrderStatus.PartiallyInvoiced)
                    so.Status = OrderStatus.PartiallyInvoiced;
                else if (so.DeliveryStatus != OrderStatus.Draft) 
                    so.Status = so.DeliveryStatus;
                else
                    so.Status = OrderStatus.Confirmed;
            }
            }


        // Update Delivery Challan Status if linked
        if (dto.DeliveryChallanId.HasValue)
        {
            var dc = await _context.DeliveryChallans
                .Include(x => x.Lines)
                .FirstOrDefaultAsync(x => x.Id == dto.DeliveryChallanId.Value, cancellationToken);
            
            if (dc != null)
            {
                 var allInvoiced = dc.Lines.All(l => l.InvoicedQuantity >= l.DeliveredQuantity);
                 if (allInvoiced)
                 {
                     dc.Status = DeliveryChallanStatus.Invoiced;
                 }
            }
        }

        _context.Invoices.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        
        // Handle Auto-DC Post-Save (to ensure Invoice ID exists if needed, though they are independent)
        if (dto.SalesOrderId.HasValue && entity.SalesOrderId.HasValue)
        {
             var so = await _context.SalesOrders.FindAsync(new object[]{ dto.SalesOrderId.Value }, cancellationToken);
             if (so != null && so.OrderType == OrderType.GoodsAutoDC)
             {
                 // Create Command directly
                 var command = new CreateDeliveryChallanCommand
                 {
                     SalesOrderId = so.Id,
                     CustomerId = so.CustomerId,
                     ChallanDate = DateTime.UtcNow,
                     Lines = dto.Items.Select(i => new DeliveryChallanLineDto
                     {
                         SalesOrderItemId = i.SalesOrderItemId ?? Guid.Empty,
                         ItemId = i.ItemId,
                         DeliveredQuantity = i.Quantity,
                         Description = i.Description
                     }).ToList(),
                     Purpose = (int)DeliveryPurpose.Sale
                 };
                 
                 await _sender.Send(command, cancellationToken);
             }
        }

        return entity.Id;
    }
}

