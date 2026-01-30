using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Sales;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Reports.Queries;

public record GetSalesOrderReportQuery : IRequest<List<OrderStatusEntryDto>>;

public class GetSalesOrderReportQueryHandler : IRequestHandler<GetSalesOrderReportQuery, List<OrderStatusEntryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetSalesOrderReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<OrderStatusEntryDto>> Handle(GetSalesOrderReportQuery request, CancellationToken cancellationToken)
    {
        var orders = await _context.SalesOrders
            .Include(x => x.Customer)
            .OrderByDescending(x => x.OrderDate)
            .ToListAsync(cancellationToken);

        return orders.Select(x => new OrderStatusEntryDto
        {
            OrderNo = x.OrderNumber,
            Date = x.OrderDate,
            PartyName = x.Customer.Name,
            TotalAmount = x.TotalAmount,
            Status = x.Status.ToString(),
            DeliveryDate = x.ExpectedDeliveryDate
        }).ToList();
    }
}
