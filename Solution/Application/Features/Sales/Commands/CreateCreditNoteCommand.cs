using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Sales.DTOs;
using CompreoBooks.Domain.Entities.Sales;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Commands;

public record CreateCreditNoteCommand : IRequest<Guid>
{
    public Guid CustomerId { get; set; }
    public Guid? InvoiceId { get; set; }
    public DateTime CreditNoteDate { get; set; }
    public string? Reason { get; set; }
    public List<CreateCreditNoteLineDto> Lines { get; set; } = new();
}

public class CreateCreditNoteLineDto
{
    public Guid ItemId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public decimal TaxRate { get; set; }
}

public class CreateCreditNoteCommandValidator : AbstractValidator<CreateCreditNoteCommand>
{
    public CreateCreditNoteCommandValidator()
    {
        RuleFor(v => v.CustomerId).NotEmpty();
        RuleFor(v => v.CreditNoteDate).NotEmpty();
        RuleFor(v => v.Lines).NotEmpty();
    }
}

public class CreateCreditNoteCommandHandler : IRequestHandler<CreateCreditNoteCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateCreditNoteCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateCreditNoteCommand request, CancellationToken cancellationToken)
    {
        // Generate Credit Note Number
        var count = await _context.CreditNotes.CountAsync(cancellationToken) + 1;
        var creditNoteNumber = $"CN-{count:D4}";
        while (await _context.CreditNotes.AnyAsync(x => x.CreditNoteNumber == creditNoteNumber, cancellationToken))
        {
            count++;
            creditNoteNumber = $"CN-{count:D4}";
        }

        var entity = new CreditNote
        {
            CreditNoteNumber = creditNoteNumber,
            CustomerId = request.CustomerId,
            InvoiceId = request.InvoiceId,
            CreditNoteDate = request.CreditNoteDate.ToUniversalTime(),
            Reason = request.Reason,
            Status = CreditNoteStatus.Draft
        };

        foreach (var itemDto in request.Lines)
        {
            var taxAmount = (itemDto.Quantity * itemDto.Rate) * (itemDto.TaxRate / 100);
            var amount = (itemDto.Quantity * itemDto.Rate) + taxAmount;

            entity.Lines.Add(new CreditNoteLine
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

        entity.SubTotal = entity.Lines.Sum(x => x.Quantity * x.Rate);
        entity.TaxAmount = entity.Lines.Sum(x => x.TaxAmount);
        entity.TotalAmount = entity.Lines.Sum(x => x.Amount);

        _context.CreditNotes.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
