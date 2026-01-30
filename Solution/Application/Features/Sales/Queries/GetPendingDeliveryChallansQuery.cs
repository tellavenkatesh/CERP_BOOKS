using AutoMapper;
using AutoMapper.QueryableExtensions;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Sales;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Queries;

public record GetPendingDeliveryChallansQuery(Guid CustomerId) : IRequest<List<PendingDeliveryChallanDto>>;

public class PendingDeliveryChallanDto
{
    public Guid Id { get; set; }
    public string ChallanNumber { get; set; } = string.Empty;
    public DateTime ChallanDate { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public Guid? SalesOrderId { get; set; }
    public string SalesOrderNumber { get; set; }
    public List<PendingDeliveryChallanLineDto> Lines { get; set; } = new();
}

public class PendingDeliveryChallanLineDto
{
    public Guid Id { get; set; } // DC Line Id
    public Guid ItemId { get; set; }
    public string ItemName { get; set; }
    public string Description { get; set; }
    public decimal Quantity { get; set; } // Remaining quantity to invoice (Delivered - Invoiced)
    public decimal Rate { get; set; }
    public decimal TaxRate { get; set; }
    public Guid? SalesOrderItemId { get; set; }
}

public class GetPendingDeliveryChallansQueryHandler : IRequestHandler<GetPendingDeliveryChallansQuery, List<PendingDeliveryChallanDto>>
{
    private readonly IApplicationDbContext _context;

    public GetPendingDeliveryChallansQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PendingDeliveryChallanDto>> Handle(GetPendingDeliveryChallansQuery request, CancellationToken cancellationToken)
    {
        var pendingChallans = await _context.DeliveryChallans
            .Include(dc => dc.Lines)
            .ThenInclude(l => l.Item)
            .Include(dc => dc.SalesOrder)
            .Where(dc => dc.CustomerId == request.CustomerId
                         && dc.Status != DeliveryChallanStatus.Invoiced
                         && dc.Status != DeliveryChallanStatus.Cancelled
                         && dc.Status != DeliveryChallanStatus.Draft) // Only Dispatched or Delivered
            .ToListAsync(cancellationToken);

        // Further filter in memory if needed, e.g. if partial invoicing logic is complex. 
        // For now, assuming if status is not invoiced, we can invoice it.
        // We probably only want lines that are not fully invoiced if we support partial.
        
        var result = new List<PendingDeliveryChallanDto>();

        foreach (var dc in pendingChallans)
        {
            // Filter lines that have quantity remaining to be invoiced
             var pendingLines = dc.Lines
                .Where(l => l.DeliveredQuantity > l.InvoicedQuantity)
                .Select(l => new PendingDeliveryChallanLineDto
                {
                    Id = l.Id,
                    ItemId = l.ItemId,
                    ItemName = l.Item.Name,
                    Description = l.Description,
                    Quantity = l.DeliveredQuantity - l.InvoicedQuantity, 
                    Rate = l.Rate,
                    TaxRate = l.TaxRate,
                    SalesOrderItemId = l.SalesOrderItemId
                })
                .ToList();

             if (pendingLines.Any())
             {
                 result.Add(new PendingDeliveryChallanDto
                 {
                     Id = dc.Id,
                     ChallanNumber = dc.ChallanNumber,
                     ChallanDate = dc.ChallanDate,
                     ReferenceNumber = dc.ReferenceNumber,
                     SalesOrderId = dc.SalesOrderId,
                     SalesOrderNumber = dc.SalesOrder?.OrderNumber ?? "",
                     Lines = pendingLines
                 });
             }
        }

        return result;
    }
}
