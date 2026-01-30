using System;
using System.Collections.Generic;
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

public record UpdatePurchaseOrderCommand(Guid Id, CreatePurchaseOrderDto Dto) : IRequest<string>;

public class UpdatePurchaseOrderCommandValidator : AbstractValidator<UpdatePurchaseOrderCommand>
{
    public UpdatePurchaseOrderCommandValidator()
    {
        RuleFor(v => v.Id).NotEmpty();
        RuleFor(v => v.Dto.VendorId).NotEmpty();
        RuleFor(v => v.Dto.OrderDate).NotEmpty();
        RuleFor(v => v.Dto.Items).NotEmpty();
    }
}

public class UpdatePurchaseOrderCommandHandler : IRequestHandler<UpdatePurchaseOrderCommand, string>
{
    private readonly IApplicationDbContext _context;

    public UpdatePurchaseOrderCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<string> Handle(UpdatePurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.PurchaseOrders
            .Include(po => po.Items)
            .FirstOrDefaultAsync(po => po.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"Purchase Order with ID {request.Id} not found.");
        }

        // Allow updates if not Received/Closed
        if (entity.Status == PurchaseOrderStatus.FullyReceived || entity.Status == PurchaseOrderStatus.Closed || entity.Status == PurchaseOrderStatus.Cancelled)
        {
            throw new Exception($"Cannot update Purchase Order in {entity.Status} status.");
        }

        var dto = request.Dto;

        entity.VendorId = dto.VendorId;
        entity.OrderDate = dto.OrderDate.ToUniversalTime();
        entity.ExpectedDeliveryDate = dto.ExpectedDeliveryDate?.ToUniversalTime();
        entity.DeliveryAddress = dto.DeliveryAddress ?? string.Empty;
        entity.PaymentTerms = dto.PaymentTerms ?? string.Empty;
        entity.PurchaseRequestId = dto.PurchaseRequestId;

        // Replace Items
        _context.PurchaseOrderItems.RemoveRange(entity.Items);
        entity.Items.Clear();

        foreach (var itemDto in dto.Items)
        {
            var taxAmount = (itemDto.Quantity * itemDto.UnitPrice) * (itemDto.TaxRate / 100);
            var totalAmount = (itemDto.Quantity * itemDto.UnitPrice) + taxAmount;

            entity.Items.Add(new PurchaseOrderItem
            {
                ItemId = itemDto.ItemId,
                Description = itemDto.Description,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice,
                TaxRate = itemDto.TaxRate,
                TaxAmount = taxAmount,
                TotalAmount = totalAmount,
                ReceivedQuantity = 0
            });
        }
        
        entity.TotalAmount = entity.Items.Sum(x => x.TotalAmount);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id.ToString();
    }
}
