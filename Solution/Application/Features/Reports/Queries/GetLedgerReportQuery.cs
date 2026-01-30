using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Financial;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Reports.Queries;

public record GetLedgerReportQuery(Guid AccountId, DateTime FromDate, DateTime ToDate) : IRequest<LedgerReportDto>;

public class LedgerReportDto
{
    public Guid AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public decimal OpeningBalance { get; set; }
    public List<LedgerTransactionDto> Transactions { get; set; } = new();
    public decimal ClosingBalance { get; set; }
}

public class LedgerTransactionDto
{
    public DateTime Date { get; set; }
    public string VoucherType { get; set; } = string.Empty; // Journal, Payment, Receipt, Invoice, Bill
    public string VoucherNumber { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
    public decimal RunningBalance { get; set; }
}

public class GetLedgerReportQueryHandler : IRequestHandler<GetLedgerReportQuery, LedgerReportDto>
{
    private readonly IApplicationDbContext _context;

    public GetLedgerReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<LedgerReportDto> Handle(GetLedgerReportQuery request, CancellationToken cancellationToken)
    {
        var account = await _context.Accounts.FindAsync(new object[] { request.AccountId }, cancellationToken);
        if (account == null) throw new Exception("Account not found");

        // Fetch all Journal Entry Lines involving this account
        // Note: Ideally all transactions (Invoices, Bills, Payments) should post to General Ledger (JournalEntries).
        // If we haven't implemented auto-posting for everything yet, this report might be incomplete.
        // Assuming for now that we rely on JournalEntries as the source of truth for GL.
        
        var query = _context.JournalEntryLines
            .Include(x => x.JournalEntry)
            .Where(x => x.AccountId == request.AccountId && x.JournalEntry.JournalDate <= request.ToDate)
            .OrderBy(x => x.JournalEntry.JournalDate);

        var allLines = await query.ToListAsync(cancellationToken);

        var openingLines = allLines.Where(x => x.JournalEntry.JournalDate < request.FromDate).ToList();
        var periodLines = allLines.Where(x => x.JournalEntry.JournalDate >= request.FromDate).ToList();

        decimal openingBalance = account.OpeningBalance;
        // Adjust opening balance with transactions before FromDate
        foreach (var line in openingLines)
        {
            openingBalance += (line.DebitAmount - line.CreditAmount);
        }

        var report = new LedgerReportDto
        {
            AccountId = account.Id,
            AccountName = account.Name,
            OpeningBalance = openingBalance,
            Transactions = new List<LedgerTransactionDto>()
        };

        decimal currentBalance = openingBalance;

        foreach (var line in periodLines)
        {
            currentBalance += (line.DebitAmount - line.CreditAmount);

            report.Transactions.Add(new LedgerTransactionDto
            {
                Date = line.JournalEntry.JournalDate,
                VoucherType = "Journal Entry", // Or specific type if we store it
                VoucherNumber = line.JournalEntry.JournalNumber,
                Description = line.JournalEntry.Narration,
                Debit = line.DebitAmount,
                Credit = line.CreditAmount,
                RunningBalance = currentBalance
            });
        }

        report.ClosingBalance = currentBalance;

        return report;
    }
}
