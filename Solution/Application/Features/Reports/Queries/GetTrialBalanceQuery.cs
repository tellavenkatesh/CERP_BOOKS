using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Reports.Queries;

public record GetTrialBalanceQuery(DateTime AsOfDate) : IRequest<TrialBalanceDto>;

public class TrialBalanceDto
{
    public DateTime AsOfDate { get; set; }
    public List<TrialBalanceLineDto> Lines { get; set; } = new();
    public decimal TotalDebit { get; set; }
    public decimal TotalCredit { get; set; }
}

public class TrialBalanceLineDto
{
    public Guid AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public string AccountCode { get; set; } = string.Empty;
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
}

public class GetTrialBalanceQueryHandler : IRequestHandler<GetTrialBalanceQuery, TrialBalanceDto>
{
    private readonly IApplicationDbContext _context;

    public GetTrialBalanceQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TrialBalanceDto> Handle(GetTrialBalanceQuery request, CancellationToken cancellationToken)
    {
        var accounts = await _context.Accounts.ToListAsync(cancellationToken);
        
        var report = new TrialBalanceDto { AsOfDate = request.AsOfDate };

        // Fetch all Journal Entry Lines up to AsOfDate
        // Optimizing this: Group by AccountId in DB
        var balances = await _context.JournalEntryLines
            .Where(x => x.JournalEntry.JournalDate <= request.AsOfDate)
            .GroupBy(x => x.AccountId)
            .Select(g => new 
            {
                AccountId = g.Key,
                TotalDebit = g.Sum(x => x.DebitAmount),
                TotalCredit = g.Sum(x => x.CreditAmount)
            })
            .ToListAsync(cancellationToken);

        foreach (var account in accounts)
        {
            var bal = balances.FirstOrDefault(x => x.AccountId == account.Id);
            decimal debit = 0;
            decimal credit = 0;
            
            // Include Opening Balance
            // Asset/Expense: Opening is Debit
            // Liability/Equity/Income: Opening is Credit
            // Simplified assumption for now, or check AccountType
            // Assuming Account.OpeningBalance is positive, we need to know if it's Dr or Cr.
            // Usually assets are Dr, Liab are Cr.
            
            decimal netBalance = account.OpeningBalance; // Need to handle Dr/Cr logic
            
            if (bal != null)
            {
                netBalance += (bal.TotalDebit - bal.TotalCredit);
            }

            if (netBalance > 0) debit = netBalance;
            else credit = -netBalance;

            if (debit != 0 || credit != 0)
            {
                report.Lines.Add(new TrialBalanceLineDto
                {
                    AccountId = account.Id,
                    AccountName = account.Name,
                    AccountCode = account.Code,
                    Debit = debit,
                    Credit = credit
                });
            }
        }

        report.TotalDebit = report.Lines.Sum(x => x.Debit);
        report.TotalCredit = report.Lines.Sum(x => x.Credit);

        return report;
    }
}
