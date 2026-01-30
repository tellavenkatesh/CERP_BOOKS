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

public record CreateBillCommand(CreateBillDto Dto) : IRequest<Guid>;

public class CreateBillCommandValidator : AbstractValidator<CreateBillCommand>
{
    public CreateBillCommandValidator()
    {
        RuleFor(v => v.Dto.VendorId).NotEmpty();
        RuleFor(v => v.Dto.BillDate).NotEmpty();
        RuleFor(v => v.Dto.VendorBillNumber).NotEmpty();
        RuleFor(v => v.Dto.Items).NotEmpty();
    }
}

public class CreateBillCommandHandler : IRequestHandler<CreateBillCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateBillCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateBillCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Dto;

        // Generate Bill Number
        var count = await _context.Bills.CountAsync(cancellationToken) + 1;
        var billNumber = $"BILL-{(count):D4}";
        while (await _context.Bills.AnyAsync(x => x.BillNumber == billNumber, cancellationToken))
        {
            count++;
            billNumber = $"BILL-{(count):D4}";
        }

        var entity = new Bill
        {
            BillNumber = billNumber,
            VendorBillNumber = dto.VendorBillNumber,
            VendorId = dto.VendorId,
            PurchaseOrderId = dto.PurchaseOrderId,
            GrnId = dto.GrnId,
            BillDate = dto.BillDate.ToUniversalTime(),
            DueDate = dto.DueDate.ToUniversalTime(),
            TdsCategory = dto.TdsCategory,
            TdsRate = dto.TdsRate,
            Status = BillStatus.Posted,
            MatchStatus = MatchStatus.Matched // Default to Matched, downgrade if variances found
        };

        foreach (var itemDto in dto.Items)
        {
            var taxAmount = (itemDto.Quantity * itemDto.Rate) * (itemDto.TaxRate / 100);
            var amount = (itemDto.Quantity * itemDto.Rate) + taxAmount;

            entity.Items.Add(new BillLine
            {
                ItemId = itemDto.ItemId,
                Description = itemDto.Description,
                Quantity = itemDto.Quantity,
                Rate = itemDto.Rate,
                TaxRate = itemDto.TaxRate,
                TaxAmount = taxAmount,
                Amount = amount
            });
        }

        entity.SubTotal = entity.Items.Sum(x => x.Quantity * x.Rate);
        entity.TaxAmount = entity.Items.Sum(x => x.TaxAmount);
        entity.TotalAmount = entity.Items.Sum(x => x.Amount);
        
        // Calculate TDS
        if (entity.TotalAmount > 0 && entity.TdsRate > 0)
        {
            entity.TdsAmount = entity.TotalAmount * (entity.TdsRate / 100);
        }

        // 3-Way Match Verification
        if (dto.GrnId.HasValue)
        {
            var grn = await _context.Grns
                .Include(g => g.Items)
                .Include(g => g.PurchaseOrder).ThenInclude(po => po!.Items)
                .FirstOrDefaultAsync(g => g.Id == dto.GrnId, cancellationToken);
            
            if (grn == null) throw new Exception("Invalid GRN selected.");

            bool hasVariance = false;

            // Verify Quantities against GRN
            foreach (var item in dto.Items)
            {
                var grnItem = grn.Items.FirstOrDefault(i => i.ItemId == item.ItemId);
                if (grnItem == null) 
                {
                    hasVariance = true; 
                    continue; // Extra item in bill
                }

                if (item.Quantity > grnItem.Quantity)
                {
                    hasVariance = true; // Billed more than received
                }
                
                // Price Verification against PO
                if (grn.PurchaseOrder != null)
                {
                    var poItem = grn.PurchaseOrder.Items.FirstOrDefault(i => i.ItemId == item.ItemId);
                    if (poItem != null)
                    {
                         if (item.Rate > poItem.UnitPrice)
                         {
                             hasVariance = true; // Price higher than PO
                         }
                    }
                }
            }

            if (hasVariance)
            {
                entity.MatchStatus = MatchStatus.Mismatch;
            }
        }
        else if (dto.PurchaseOrderId.HasValue)
        {
            // 2-Way Match (PO vs Invoice)
            var po = await _context.PurchaseOrders
                .Include(p => p.Items)
                .FirstOrDefaultAsync(p => p.Id == dto.PurchaseOrderId, cancellationToken);
            
            if (po == null) throw new Exception("Invalid PO selected.");
            
            // Check for major discrepancies
            // For now, simpler check
            if (entity.TotalAmount > po.TotalAmount * 1.1m) // 10% tolerance on total?
            {
                entity.MatchStatus = MatchStatus.Mismatch;
            }
        }
        else
        {
            // No reference
            entity.MatchStatus = MatchStatus.Manual;
        }

        _context.Bills.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
