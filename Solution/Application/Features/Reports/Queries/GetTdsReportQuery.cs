using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Reports.Queries;

public record GetTdsReportQuery(DateTime FromDate, DateTime ToDate) : IRequest<List<TdsReportEntryDto>>;

public class GetTdsReportQueryHandler : IRequestHandler<GetTdsReportQuery, List<TdsReportEntryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetTdsReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TdsReportEntryDto>> Handle(GetTdsReportQuery request, CancellationToken cancellationToken)
    {
        // Strategy: Fetch Journal Entries credited to "TDS Payable" accounts
        // We look for accounts with "TDS" in the name and type Liability.

        var tdsAccountIds = await _context.Accounts
            .Where(a => a.Name.Contains("TDS") && (a.Type == Domain.Entities.Masters.AccountType.Liability || a.Type == Domain.Entities.Masters.AccountType.Expense))
            .Select(a => a.Id)
            .ToListAsync(cancellationToken);

        var report = new List<TdsReportEntryDto>();
        
        if (!tdsAccountIds.Any()) return report;

        // Find Journal Lines for these accounts
        var tdsLines = await _context.JournalEntryLines
            .Include(x => x.JournalEntry)
            .Include(x => x.Account) // The TDS Account
            // We need the Party too? Often TDS deduction is against a Party in the same Journal Entry
            .Where(x => tdsAccountIds.Contains(x.AccountId) 
                     && x.JournalEntry.JournalDate >= request.FromDate 
                     && x.JournalEntry.JournalDate <= request.ToDate)
            .ToListAsync(cancellationToken);

        foreach (var tdsLine in tdsLines)
        {
            // The TDS Line is the Credit side (Liability increases).
            // We need to find the Party from the *other* lines in the same Journal Entry (e.g., Party Account Credited net of TDS, or Expense Debited).
            // Usually: 
            // Dr Expense 1000
            // Cr TDS Payable 100
            // Cr Vendor (Party) 900
            
            // So we fetch the full entry
            var entry = await _context.JournalEntries
                .Include(x => x.Lines).ThenInclude(l => l.Party)
                .FirstOrDefaultAsync(x => x.Id == tdsLine.JournalEntryId, cancellationToken);

            if (entry == null) continue;

            var partyLine = entry.Lines.FirstOrDefault(l => l.PartyId != null);
            var expenseLine = entry.Lines.FirstOrDefault(l => l.DebitAmount > 0 && l.AccountId != tdsLine.AccountId);

            decimal grossAmount = expenseLine?.DebitAmount ?? 0; // Gross Payment Amount

            report.Add(new TdsReportEntryDto
            {
                Section = "TDS", // Ideally derived from TdsCategory link on Account or Party
                PartyName = partyLine?.Party?.Name ?? "Unknown",
                PaymentAmount = grossAmount,
                TdsRate = grossAmount > 0 ? (tdsLine.CreditAmount / grossAmount) * 100 : 0,
                TdsDeducted = tdsLine.CreditAmount > 0 ? tdsLine.CreditAmount : tdsLine.DebitAmount, // Use whatever is non-zero
                PaymentDate = entry.JournalDate
            });
        }

        return report;
    }
}
