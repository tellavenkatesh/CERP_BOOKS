using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Sales;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Commands;

public record CreateDeliveryChallanCommand : IRequest<Guid>
{
    public DateTime ChallanDate { get; set; }
    public Guid CustomerId { get; set; }
    public Guid? SalesOrderId { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? PlaceOfSupply { get; set; }
    public string? DeliveryAddress { get; set; }
    public string? VehicleNumber { get; set; }
    public string? EWayBillNumber { get; set; }
    public string? ChallanType { get; set; }
    public int Purpose { get; set; } // DeliveryPurpose
    public string? Notes { get; set; }
    
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Adjustment { get; set; }
    public decimal RoundOff { get; set; }
    public decimal TotalAmount { get; set; }

    public List<DeliveryChallanLineDto> Lines { get; set; } = new();
}

public record DeliveryChallanLineDto
{
    public Guid? SalesOrderItemId { get; set; }
    public Guid ItemId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal DeliveredQuantity { get; set; }
    public decimal Rate { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Discount { get; set; }
    public decimal Amount { get; set; }
}

public class CreateDeliveryChallanCommandValidator : AbstractValidator<CreateDeliveryChallanCommand>
{
    public CreateDeliveryChallanCommandValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.ChallanDate).NotEmpty();
        RuleFor(x => x.Lines).NotEmpty();
        RuleForEach(x => x.Lines).ChildRules(line =>
        {
            line.RuleFor(x => x.ItemId).NotEmpty();
            line.RuleFor(x => x.DeliveredQuantity).GreaterThan(0);
        });
    }
}

public class CreateDeliveryChallanCommandHandler : IRequestHandler<CreateDeliveryChallanCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateDeliveryChallanCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateDeliveryChallanCommand request, CancellationToken cancellationToken)
    {
        // 1. Generate Challan Number
        var count = await _context.DeliveryChallans.CountAsync(cancellationToken) + 1;
        var challanNumber = $"DC-{count:0000}";
        while (await _context.DeliveryChallans.AnyAsync(x => x.ChallanNumber == challanNumber, cancellationToken))
        {
            count++;
            challanNumber = $"DC-{count:0000}";
        }

        var entity = new DeliveryChallan
        {
            ChallanDate = request.ChallanDate.ToUniversalTime(),
            CustomerId = request.CustomerId,
            SalesOrderId = request.SalesOrderId,
            DeliveryAddress = request.DeliveryAddress,
            VehicleNumber = request.VehicleNumber,
            EWayBillNumber = request.EWayBillNumber,
            Purpose = (DeliveryPurpose)request.Purpose,
            Status = DeliveryChallanStatus.Draft, // Default to Draft
            Notes = request.Notes,
            ChallanNumber = challanNumber,
            
            ReferenceNumber = request.ReferenceNumber,
            PlaceOfSupply = request.PlaceOfSupply,
            ChallanType = request.ChallanType,
            
            SubTotal = request.SubTotal,
            TaxAmount = request.TaxAmount,
            Adjustment = request.Adjustment,
            RoundOff = request.RoundOff,
            TotalAmount = request.TotalAmount
        };

        foreach (var lineDto in request.Lines)
        {
            // If linked to SO, get ordered qty and update delivered qty
            decimal orderedQty = 0;
            if (lineDto.SalesOrderItemId.HasValue)
            {
                var soItem = await _context.SalesOrderItems.FindAsync(new object[] { lineDto.SalesOrderItemId.Value }, cancellationToken);
                if (soItem != null)
                {
                    orderedQty = soItem.Quantity;
                    soItem.QuantityDelivered += lineDto.DeliveredQuantity; // Update delivered qty
                }
            }

            entity.Lines.Add(new DeliveryChallanLine
            {
                SalesOrderItemId = lineDto.SalesOrderItemId,
                ItemId = lineDto.ItemId,
                Description = lineDto.Description,
                OrderedQuantity = orderedQty,
                DeliveredQuantity = lineDto.DeliveredQuantity,
                InvoicedQuantity = 0,
                
                Rate = lineDto.Rate,
                TaxRate = lineDto.TaxRate,
                TaxAmount = lineDto.TaxAmount,
                Discount = lineDto.Discount,
                Amount = lineDto.Amount
            });
        }

        // Update Sales Order Status if linked
        if (request.SalesOrderId.HasValue)
        {
            var so = await _context.SalesOrders
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.Id == request.SalesOrderId.Value, cancellationToken);

            if (so != null)
            {
                // Calculate Delivery Status
                var allDelivered = so.Items.All(i => i.QuantityDelivered >= i.Quantity);
                var anyDelivered = so.Items.Any(i => i.QuantityDelivered > 0);

                if (allDelivered) so.DeliveryStatus = OrderStatus.FullyDelivered;
                else if (anyDelivered) so.DeliveryStatus = OrderStatus.PartiallyDelivered;
                else so.DeliveryStatus = OrderStatus.Confirmed; // Or Draft?

                // Logic for Overall Status
                if (so.DeliveryStatus == OrderStatus.FullyDelivered && so.InvoiceStatus == OrderStatus.FullyInvoiced)
                    so.Status = OrderStatus.Closed;
                else if (so.DeliveryStatus == OrderStatus.FullyDelivered)
                    so.Status = OrderStatus.FullyDelivered;
                else if (so.DeliveryStatus == OrderStatus.PartiallyDelivered)
                    so.Status = OrderStatus.PartiallyDelivered;
                else
                    so.Status = OrderStatus.Confirmed; // Fallback
            }
        }

        _context.DeliveryChallans.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
