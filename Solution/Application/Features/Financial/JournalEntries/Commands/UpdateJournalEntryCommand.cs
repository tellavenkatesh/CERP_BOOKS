using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Financial;
using MediatR;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Financial.JournalEntries.Commands;

public record UpdateJournalEntryCommand : IRequest<Unit>
{
    public Guid Id { get; set; }
    public DateTime JournalDate { get; set; }
    public string Narration { get; set; } = string.Empty;
    public string Status { get; set; } = "Draft";
    public List<JournalEntryLineCommand> Lines { get; set; } = new();
}

public class UpdateJournalEntryCommandValidator : AbstractValidator<UpdateJournalEntryCommand>
{
    public UpdateJournalEntryCommandValidator()
    {
        RuleFor(v => v.Id).NotEmpty();
        RuleFor(v => v.Narration).NotEmpty();
        RuleFor(v => v.JournalDate).NotEmpty();
        RuleFor(v => v.Lines).NotEmpty().Must(lines => 
            Math.Abs(lines.Sum(l => l.DebitAmount) - lines.Sum(l => l.CreditAmount)) < 0.01m)
            .WithMessage("Total Debits must equal Total Credits");
    }
}

public class UpdateJournalEntryCommandHandler : IRequestHandler<UpdateJournalEntryCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public UpdateJournalEntryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(UpdateJournalEntryCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.JournalEntries
            .Include(x => x.Lines)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            throw new KeyNotFoundException($"Journal Entry with ID {request.Id} not found.");
        }

        entity.JournalDate = request.JournalDate.ToUniversalTime();
        entity.Narration = request.Narration;
        entity.Status = Enum.TryParse<JournalEntryStatus>(request.Status, true, out var status) ? status : JournalEntryStatus.Draft;

        // Update Lines: A simple approach is to remove existing and add new.
        // For better performance on large sets, we would reconcile, but for Journal Entries usually minimal lines, this is fine.
        _context.JournalEntryLines.RemoveRange(entity.Lines);
        
        entity.Lines = request.Lines.Select(l => new JournalEntryLine
        {
            AccountId = l.AccountId,
            PartyId = l.PartyId,
            Description = l.Description,
            DebitAmount = l.DebitAmount,
            CreditAmount = l.CreditAmount,
            JournalEntryId = entity.Id 
        }).ToList();

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
