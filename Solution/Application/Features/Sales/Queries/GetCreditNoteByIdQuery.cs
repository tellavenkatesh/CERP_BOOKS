using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Sales;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Queries;

public record GetCreditNoteByIdQuery(Guid Id) : IRequest<CreditNoteDetailDto>;

public class CreditNoteDetailDto
{
    public Guid Id { get; set; }
    public string CreditNoteNumber { get; set; } = string.Empty;
    public DateTime CreditNoteDate { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public Guid? InvoiceId { get; set; }
    public string? InvoiceNumber { get; set; }
    public string? Reason { get; set; }
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<CreditNoteLineDto> Lines { get; set; } = new();
}

public class CreditNoteLineDto
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

public class GetCreditNoteByIdQueryHandler : IRequestHandler<GetCreditNoteByIdQuery, CreditNoteDetailDto>
{
    private readonly IApplicationDbContext _context;

    public GetCreditNoteByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CreditNoteDetailDto> Handle(GetCreditNoteByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.CreditNotes
            .Include(x => x.Customer)
            .Include(x => x.Invoice)
            .Include(x => x.Lines)
            .ThenInclude(x => x.Item)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (entity == null) return null!;

        return new CreditNoteDetailDto
        {
            Id = entity.Id,
            CreditNoteNumber = entity.CreditNoteNumber,
            CreditNoteDate = entity.CreditNoteDate,
            CustomerId = entity.CustomerId,
            CustomerName = entity.Customer.Name,
            InvoiceId = entity.InvoiceId,
            InvoiceNumber = entity.Invoice?.InvoiceNumber,
            Reason = entity.Reason,
            SubTotal = entity.SubTotal,
            TaxAmount = entity.TaxAmount,
            TotalAmount = entity.TotalAmount,
            Status = entity.Status.ToString(),
            Lines = entity.Lines.Select(l => new CreditNoteLineDto
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
