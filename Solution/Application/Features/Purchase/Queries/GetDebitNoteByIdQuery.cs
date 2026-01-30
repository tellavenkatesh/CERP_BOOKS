using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Purchase;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Purchase.Queries;

public record GetDebitNoteByIdQuery(Guid Id) : IRequest<DebitNoteDetailDto>;

public class DebitNoteDetailDto
{
    public Guid Id { get; set; }
    public string DebitNoteNumber { get; set; } = string.Empty;
    public DateTime DebitNoteDate { get; set; }
    public Guid VendorId { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public Guid? BillId { get; set; }
    public string? BillNumber { get; set; }
    public string? Reason { get; set; }
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<DebitNoteLineDto> Lines { get; set; } = new();
}

public class DebitNoteLineDto
{
    public Guid Id { get; set; }
    public Guid ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Amount { get; set; }
}

public class GetDebitNoteByIdQueryHandler : IRequestHandler<GetDebitNoteByIdQuery, DebitNoteDetailDto>
{
    private readonly IApplicationDbContext _context;

    public GetDebitNoteByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DebitNoteDetailDto> Handle(GetDebitNoteByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.DebitNotes
            .Include(x => x.Vendor)
            .Include(x => x.Bill)
            .Include(x => x.Lines)
            .ThenInclude(x => x.Item)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (entity == null) return null!;

        return new DebitNoteDetailDto
        {
            Id = entity.Id,
            DebitNoteNumber = entity.DebitNoteNumber,
            DebitNoteDate = entity.DebitNoteDate,
            VendorId = entity.VendorId,
            VendorName = entity.Vendor.Name,
            BillId = entity.BillId,
            BillNumber = entity.Bill?.BillNumber,
            Reason = entity.Reason,
            SubTotal = entity.SubTotal,
            TaxAmount = entity.TaxAmount,
            TotalAmount = entity.TotalAmount,
            Status = entity.Status.ToString(),
            Lines = entity.Lines.Select(l => new DebitNoteLineDto
            {
                Id = l.Id,
                ItemId = l.ItemId,
                ItemName = l.Item.Name,
                Description = l.Description,
                Quantity = l.Quantity,
                Rate = l.Rate,
                TaxRate = l.TaxRate,
                TaxAmount = l.TaxAmount,
                Amount = l.Amount
            }).ToList()
        };
    }
}
