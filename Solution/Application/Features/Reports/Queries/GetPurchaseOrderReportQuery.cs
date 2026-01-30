using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Purchase;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Reports.Queries;

public record GetPurchaseOrderReportQuery : IRequest<List<OrderStatusEntryDto>>;

public class GetPurchaseOrderReportQueryHandler : IRequestHandler<GetPurchaseOrderReportQuery, List<OrderStatusEntryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetPurchaseOrderReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<OrderStatusEntryDto>> Handle(GetPurchaseOrderReportQuery request, CancellationToken cancellationToken)
    {
         var orders = await _context.PurchaseOrders
            .Include(x => x.Vendor)
            .OrderByDescending(x => x.OrderDate)
            .ToListAsync(cancellationToken);

        return orders.Select(x => new OrderStatusEntryDto
        {
            OrderNo = x.OrderNumber,
            Date = x.OrderDate,
            PartyName = x.Vendor.Name,
            TotalAmount = x.TotalAmount,
            Status = x.Status.ToString(),
            DeliveryDate = x.ExpectedDeliveryDate
        }).ToList();
    }
}
