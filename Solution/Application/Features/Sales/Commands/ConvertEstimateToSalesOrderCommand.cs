using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Sales;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Commands;

public class ConvertEstimateToSalesOrderCommand : IRequest<Guid>
{
    public Guid EstimateId { get; set; }
    public string PublicToken { get; set; } = string.Empty;

    public ConvertEstimateToSalesOrderCommand(Guid estimateId, string publicToken)
    {
        EstimateId = estimateId;
        PublicToken = publicToken;
    }
}

public class ConvertEstimateToSalesOrderCommandHandler : IRequestHandler<ConvertEstimateToSalesOrderCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public ConvertEstimateToSalesOrderCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(ConvertEstimateToSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var estimate = await _context.Estimates
            .Include(e => e.Items)
            .FirstOrDefaultAsync(e => e.Id == request.EstimateId, cancellationToken);

        if (estimate == null) throw new Exception("Estimate not found");

        // Verify Token
        if (estimate.PublicViewToken?.ToString() != request.PublicToken)
            throw new Exception("Invalid Public Token");

        if (estimate.Status != EstimateStatus.Accepted)
            throw new Exception("Only accepted estimates can be converted to an order.");

        // Create Sales Order
        // Generate SO Number logic (simplified for now, ideally use NumberingSeries)
        var soCount = await _context.SalesOrders.CountAsync(cancellationToken) + 1;
        var soNumber = $"SO-{soCount:D4}";

        var salesOrder = new SalesOrder
        {
            OrderNumber = soNumber,
            OrderDate = DateTime.UtcNow,
            CustomerId = estimate.CustomerId,
            CustomerPONumber = estimate.ReferenceNumber, // Customer PO
            // Salesperson = estimate.Salesperson, // Not in SO
            // ProjectName = estimate.ProjectName, // Not in SO
            PaymentTerms = "Net 30", // Default or fetch from customer
            // CustomerNotes = estimate.CustomerNotes, // Not in SO
            
            // SubTotal = estimate.SubTotal, // Not in SO
            // TaxAmount = estimate.TaxAmount, // Not in SO
            // ShippingCharges = estimate.ShippingCharges, // Not in SO
            // Adjustment = estimate.Adjustment, // Not in SO
            TotalAmount = estimate.TotalAmount,
            
            Status = OrderStatus.Confirmed, 
            ApprovalStatus = ApprovalStatus.Approved
        };

        foreach (var item in estimate.Items)
        {
            salesOrder.Items.Add(new SalesOrderItem
            {
                SalesOrderId = salesOrder.Id,
                ItemId = item.ItemId,
                Description = item.Description,
                Quantity = item.Quantity,
                UnitPrice = item.Rate, // Mapped from Rate
                TaxRate = item.TaxRate,
                TaxAmount = item.TaxAmount,
                TotalAmount = item.Amount // Mapped from Amount
            });
        }

        _context.SalesOrders.Add(salesOrder);
        
        // Update Estimate Status
        estimate.Status = EstimateStatus.ConvertedToOrder;

        await _context.SaveChangesAsync(cancellationToken);

        return salesOrder.Id;
    }
}
