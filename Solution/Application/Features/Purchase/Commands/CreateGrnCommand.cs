using System;
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

public record CreateGrnCommand(CreateGrnDto Dto) : IRequest<Guid>;

public class CreateGrnCommandValidator : AbstractValidator<CreateGrnCommand>
{
    public CreateGrnCommandValidator()
    {
        RuleFor(v => v.Dto.VendorId).NotEmpty();
        RuleFor(v => v.Dto.GrnDate).NotEmpty();
        RuleFor(v => v.Dto.Items).NotEmpty();
    }
}

public class CreateGrnCommandHandler : IRequestHandler<CreateGrnCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateGrnCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateGrnCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        var count = await _context.Grns.CountAsync(cancellationToken);
        var grnNumber = $"GRN-{(count + 1):D4}";

        var entity = new Grn
        {
            GrnNumber = grnNumber,
            VendorId = dto.VendorId,
            PurchaseOrderId = dto.PurchaseOrderId,
            GrnDate = dto.GrnDate,
            VendorInvoiceNumber = dto.VendorInvoiceNumber,
            Status = GrnStatus.Confirmed // Auto-confirm for simplicity
        };

        foreach (var itemDto in dto.Items)
        {
            entity.Items.Add(new GrnItem
            {
                ItemId = itemDto.ItemId,
                Description = itemDto.Description,
                Quantity = itemDto.Quantity
            });

            // Update PO Received Quantity
            if (dto.PurchaseOrderId.HasValue)
            {
                var poItem = await _context.PurchaseOrderItems
                    .FirstOrDefaultAsync(x => x.PurchaseOrderId == dto.PurchaseOrderId && x.ItemId == itemDto.ItemId, cancellationToken);
                
                if (poItem != null)
                {
                    poItem.ReceivedQuantity += itemDto.Quantity;
                }
            }
        }

        // Update PO Status if linked
        if (dto.PurchaseOrderId.HasValue)
        {
            var po = await _context.PurchaseOrders
                .Include(p => p.Items)
                .FirstOrDefaultAsync(p => p.Id == dto.PurchaseOrderId, cancellationToken);
            
            if (po != null)
            {
                var allReceived = po.Items.All(i => i.ReceivedQuantity >= i.Quantity);
                var anyReceived = po.Items.Any(i => i.ReceivedQuantity > 0);
                
                if (allReceived) po.Status = PurchaseOrderStatus.FullyReceived;
                else if (anyReceived) po.Status = PurchaseOrderStatus.PartiallyReceived;
            }
        }

        _context.Grns.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
