using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Sales.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Queries;

public record GetSalesOrderByIdQuery(Guid Id) : IRequest<SalesOrderDto?>;

public class GetSalesOrderByIdQueryHandler : IRequestHandler<GetSalesOrderByIdQuery, SalesOrderDto?>
{
    private readonly IApplicationDbContext _context;

    public GetSalesOrderByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SalesOrderDto?> Handle(GetSalesOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var so = await _context.SalesOrders
            .Include(s => s.Customer)
            .Include(s => s.Items)
            .ThenInclude(i => i.Item)
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (so == null) return null;

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
            OrderType = so.OrderType.ToString(),
            DeliveryStatus = so.DeliveryStatus.ToString(),
            InvoiceStatus = so.InvoiceStatus.ToString(),
            DeliveryAddress = so.DeliveryAddress,
            PaymentTerms = so.PaymentTerms,
            Salesperson = so.Salesperson,
            PlaceOfSupply = so.PlaceOfSupply,
            ShippingCharges = so.ShippingCharges,
            Adjustment = so.Adjustment,
            CustomerNotes = so.CustomerNotes,
            TermsAndConditions = so.TermsAndConditions,
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
                TotalAmount = i.TotalAmount,
                QuantityDelivered = i.QuantityDelivered,
                QuantityInvoiced = i.QuantityInvoiced
            }).ToList()
        };
    }
}
