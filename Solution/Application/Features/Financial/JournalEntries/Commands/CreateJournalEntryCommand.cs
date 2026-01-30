using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Financial;
using MediatR;
using FluentValidation;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Financial.JournalEntries.Commands;

public record JournalEntryLineCommand
{
    public Guid AccountId { get; set; }
    public Guid? PartyId { get; set; }
    public string? Description { get; set; }
    public decimal DebitAmount { get; set; }
    public decimal CreditAmount { get; set; }
}

public record CreateJournalEntryCommand : IRequest<Guid>
{
    public DateTime JournalDate { get; set; }
    public string Narration { get; set; } = string.Empty;
    public string Status { get; set; } = "Draft";
    public List<JournalEntryLineCommand> Lines { get; set; } = new();
}

public class CreateJournalEntryCommandValidator : AbstractValidator<CreateJournalEntryCommand>
{
    public CreateJournalEntryCommandValidator()
    {
        RuleFor(v => v.Narration).NotEmpty();
        RuleFor(v => v.JournalDate).NotEmpty();
        RuleFor(v => v.Lines).NotEmpty().Must(lines => 
            Math.Abs(lines.Sum(l => l.DebitAmount) - lines.Sum(l => l.CreditAmount)) < 0.01m)
            .WithMessage("Total Debits must equal Total Credits");
    }
}

public class CreateJournalEntryCommandHandler : IRequestHandler<CreateJournalEntryCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateJournalEntryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateJournalEntryCommand request, CancellationToken cancellationToken)
    {
        // Generate Journal Number
        var count = await _context.JournalEntries.CountAsync(cancellationToken) + 1;
        var journalNumber = $"JNL-{DateTime.UtcNow:yyyyMMdd}-{count:0000}";

        while (await _context.JournalEntries.AnyAsync(x => x.JournalNumber == journalNumber, cancellationToken))
        {
            count++;
            journalNumber = $"JNL-{DateTime.UtcNow:yyyyMMdd}-{count:0000}";
        }

        var entity = new JournalEntry
        {
            JournalDate = request.JournalDate.ToUniversalTime(),
            Narration = request.Narration,
            Status = Enum.TryParse<JournalEntryStatus>(request.Status, true, out var status) ? status : JournalEntryStatus.Draft,
            JournalNumber = journalNumber,
            Lines = request.Lines.Select(l => new JournalEntryLine
            {
                AccountId = l.AccountId,
                PartyId = l.PartyId,
                Description = l.Description,
                DebitAmount = l.DebitAmount,
                CreditAmount = l.CreditAmount
            }).ToList()
        };

        _context.JournalEntries.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
