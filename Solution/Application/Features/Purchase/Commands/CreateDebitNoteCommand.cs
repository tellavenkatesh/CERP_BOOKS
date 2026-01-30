using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Purchase;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Purchase.Commands;

public record CreateDebitNoteCommand : IRequest<Guid>
{
    public Guid VendorId { get; set; }
    public Guid? BillId { get; set; }
    public DateTime DebitNoteDate { get; set; }
    public string? Reason { get; set; }
    public List<CreateDebitNoteLineDto> Lines { get; set; } = new();
}

public class CreateDebitNoteLineDto
{
    public Guid ItemId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public decimal TaxRate { get; set; }
}

public class CreateDebitNoteCommandValidator : AbstractValidator<CreateDebitNoteCommand>
{
    public CreateDebitNoteCommandValidator()
    {
        RuleFor(v => v.VendorId).NotEmpty();
        RuleFor(v => v.DebitNoteDate).NotEmpty();
        RuleFor(v => v.Lines).NotEmpty();
    }
}

public class CreateDebitNoteCommandHandler : IRequestHandler<CreateDebitNoteCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateDebitNoteCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateDebitNoteCommand request, CancellationToken cancellationToken)
    {
        // Generate Debit Note Number
        var count = await _context.DebitNotes.CountAsync(cancellationToken) + 1;
        var debitNoteNumber = $"DN-{(count):D4}";
        while (await _context.DebitNotes.AnyAsync(x => x.DebitNoteNumber == debitNoteNumber, cancellationToken))
        {
            count++;
            debitNoteNumber = $"DN-{(count):D4}";
        }

        var entity = new DebitNote
        {
            DebitNoteNumber = debitNoteNumber,
            VendorId = request.VendorId,
            BillId = request.BillId,
            DebitNoteDate = request.DebitNoteDate.ToUniversalTime(),
            Reason = request.Reason,
            Status = DebitNoteStatus.Draft
        };

        foreach (var itemDto in request.Lines)
        {
            var taxAmount = (itemDto.Quantity * itemDto.Rate) * (itemDto.TaxRate / 100);
            var amount = (itemDto.Quantity * itemDto.Rate) + taxAmount;

            entity.Lines.Add(new DebitNoteLine
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

        _context.DebitNotes.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
