using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Sales.DTOs;
using CompreoBooks.Domain.Entities.Sales;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Queries;

public record GetSalesOrderPublicQuery(Guid Token) : IRequest<SalesOrderDto?>;

public class GetSalesOrderPublicQueryHandler : IRequestHandler<GetSalesOrderPublicQuery, SalesOrderDto?>
{
    private readonly IApplicationDbContext _context;

    public GetSalesOrderPublicQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SalesOrderDto?> Handle(GetSalesOrderPublicQuery request, CancellationToken cancellationToken)
    {
        var so = await _context.SalesOrders
            .Include(s => s.Customer)
            .Include(s => s.Items)
            .ThenInclude(i => i.Item)
            .FirstOrDefaultAsync(s => s.PublicViewToken == request.Token, cancellationToken);

        if (so == null) return null;

        if (so.ViewedAt == null)
        {
            so.ViewedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }

        return new SalesOrderDto
        {
            Id = so.Id,
            OrderNumber = so.OrderNumber,
            OrderDate = so.OrderDate,
            ExpectedDeliveryDate = so.ExpectedDeliveryDate,
            CustomerId = so.CustomerId,
            CustomerName = so.Customer.Name,
            CustomerPONumber = so.CustomerPONumber,
            TotalAmount = so.TotalAmount,
            Status = so.Status.ToString(),
            // Map Approval Status appropriately if useful
            OrderType = so.OrderType.ToString(),
            DeliveryAddress = so.DeliveryAddress,
            Items = so.Items.Select(i => new SalesOrderItemDto
            {
                Id = i.Id,
                ItemId = i.ItemId,
                ItemName = i.Item.Name,
                Description = i.Description,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TaxRate = i.TaxRate,
                TaxAmount = i.TaxAmount,
                TotalAmount = i.TotalAmount
            }).ToList()
        };
    }
}
