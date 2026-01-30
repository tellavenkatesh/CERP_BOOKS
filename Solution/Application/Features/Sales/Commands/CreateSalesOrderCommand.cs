using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Sales.DTOs;
using CompreoBooks.Domain.Entities.Sales;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Commands;

public record CreateSalesOrderCommand(CreateSalesOrderDto Dto) : IRequest<Guid>;

public class CreateSalesOrderCommandValidator : AbstractValidator<CreateSalesOrderCommand>
{
    public CreateSalesOrderCommandValidator()
    {
        RuleFor(v => v.Dto.CustomerId).NotEmpty();
        RuleFor(v => v.Dto.OrderDate).NotEmpty();
        RuleFor(v => v.Dto.Items).NotEmpty();
    }
}

public class CreateSalesOrderCommandHandler : IRequestHandler<CreateSalesOrderCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateSalesOrderCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateSalesOrderCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        // Fetch Company State for Tax Calculation
        var company = await _context.Companies.FirstOrDefaultAsync(cancellationToken);
        var companyState = company?.State?.Trim().ToUpper();
        var placeOfSupply = dto.PlaceOfSupply?.Trim().ToUpper();

        // Generate Order Number
        var count = await _context.SalesOrders.CountAsync(cancellationToken);
        var orderNumber = $"SO-{(count + 1):D4}";

        var entity = new SalesOrder
        {
            OrderNumber = orderNumber,
            CustomerId = dto.CustomerId,
            OrderDate = dto.OrderDate,
            ExpectedDeliveryDate = dto.ExpectedDeliveryDate,
            CustomerPONumber = dto.CustomerPONumber,
            DeliveryAddress = dto.DeliveryAddress,
            PaymentTerms = dto.PaymentTerms,
            Salesperson = dto.Salesperson,
            PlaceOfSupply = dto.PlaceOfSupply,
            ShippingCharges = dto.ShippingCharges,
            Adjustment = dto.Adjustment,
            CustomerNotes = dto.CustomerNotes,
            TermsAndConditions = dto.TermsAndConditions,
            Status = OrderStatus.Draft,
            OrderType = Enum.TryParse<OrderType>(dto.OrderType, true, out var ot) ? ot : OrderType.Standard
        };

        foreach (var itemDto in dto.Items)
        {
            var taxAmount = (itemDto.Quantity * itemDto.UnitPrice) * (itemDto.TaxRate / 100);
            var totalAmount = (itemDto.Quantity * itemDto.UnitPrice) + taxAmount;

            // Tax Split Logic
            decimal cgst = 0, sgst = 0, igst = 0;
            
            // If CompanyState is set and PlaceOfSupply matches => Intra-State (CGST + SGST)
            // Else => Inter-State (IGST)
            if (!string.IsNullOrEmpty(companyState) && !string.IsNullOrEmpty(placeOfSupply) && companyState == placeOfSupply)
            {
                cgst = taxAmount / 2;
                sgst = taxAmount / 2;
            }
            else
            {
                igst = taxAmount;
            }

            entity.Items.Add(new SalesOrderItem
            {
                ItemId = itemDto.ItemId,
                Description = itemDto.Description,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice,
                TaxRate = itemDto.TaxRate,
                TaxAmount = taxAmount,
                CgstAmount = cgst,
                SgstAmount = sgst,
                IgstAmount = igst,
                TotalAmount = totalAmount
            });
        }

        entity.TotalAmount = entity.Items.Sum(x => x.TotalAmount) + entity.ShippingCharges + entity.Adjustment;
        entity.TotalCgstAmount = entity.Items.Sum(x => x.CgstAmount);
        entity.TotalSgstAmount = entity.Items.Sum(x => x.SgstAmount);
        entity.TotalIgstAmount = entity.Items.Sum(x => x.IgstAmount);

        _context.SalesOrders.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
