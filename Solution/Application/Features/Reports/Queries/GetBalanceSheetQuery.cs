using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Masters;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Reports.Queries;

public record GetBalanceSheetQuery(DateTime AsOfDate) : IRequest<BalanceSheetDto>;

public class BalanceSheetDto
{
    public DateTime AsOfDate { get; set; }
    
    public List<BSAccountDto> Assets { get; set; } = new();
    public List<BSAccountDto> Liabilities { get; set; } = new();
    public List<BSAccountDto> Equity { get; set; } = new();
    
    public decimal TotalAssets { get; set; }
    public decimal TotalLiabilities { get; set; }
    public decimal TotalEquity { get; set; } // Includes Retained Earnings
}

public class BSAccountDto
{
    public Guid AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class GetBalanceSheetQueryHandler : IRequestHandler<GetBalanceSheetQuery, BalanceSheetDto>
{
    private readonly IApplicationDbContext _context;

    public GetBalanceSheetQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BalanceSheetDto> Handle(GetBalanceSheetQuery request, CancellationToken cancellationToken)
    {
        // 1. Calculate Balances for Assets, Liabilities, Equity (Cumulative up to AsOfDate)
        var accounts = await _context.Accounts.ToListAsync(cancellationToken);
        
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

        var report = new BalanceSheetDto { AsOfDate = request.AsOfDate };
        
        decimal totalIncome_Retained = 0;
        decimal totalExpense_Retained = 0;

        foreach (var account in accounts)
        {
            var bal = balances.FirstOrDefault(x => x.AccountId == account.Id);
            
            // Start with Opening Balance (need to handle Dr/Cr properly)
            // Assuming Account.OpeningBalance is correctly signed or we map it based on type.
            // Simplified: If Asset/Exp, Opening is Dr (+). If Liab/Eq/Inc, Opening is Cr (-).
            // Let's assume OpeningBalance property is absolute and we apply sign based on type.
            
            decimal currentDebit = bal?.TotalDebit ?? 0;
            decimal currentCredit = bal?.TotalCredit ?? 0;
            
            if (account.Type == AccountType.Asset)
            {
                decimal op = account.OpeningBalance; // Dr
                decimal net = op + currentDebit - currentCredit;
                if (net != 0) report.Assets.Add(new BSAccountDto { AccountId = account.Id, AccountName = account.Name, Amount = net });
            }
            else if (account.Type == AccountType.Liability)
            {
                decimal op = account.OpeningBalance; // Cr
                decimal net = op + currentCredit - currentDebit;
                if (net != 0) report.Liabilities.Add(new BSAccountDto { AccountId = account.Id, AccountName = account.Name, Amount = net });
            }
            else if (account.Type == AccountType.Equity)
            {
                decimal op = account.OpeningBalance; // Cr
                decimal net = op + currentCredit - currentDebit;
                if (net != 0) report.Equity.Add(new BSAccountDto { AccountId = account.Id, AccountName = account.Name, Amount = net });
            }
            else if (account.Type == AccountType.Income)
            {
                decimal op = account.OpeningBalance; // Cr
                totalIncome_Retained += (op + currentCredit - currentDebit);
            }
            else if (account.Type == AccountType.Expense)
            {
                decimal op = account.OpeningBalance; // Dr
                totalExpense_Retained += (op + currentDebit - currentCredit);
            }
        }

        // Calculate Retained Earnings (Net Profit/Loss)
        decimal retainedEarnings = totalIncome_Retained - totalExpense_Retained;
        
        if (retainedEarnings != 0)
        {
            report.Equity.Add(new BSAccountDto 
            { 
                AccountId = Guid.Empty, 
                AccountName = "Retained Earnings (Net Profit)", 
                Amount = retainedEarnings 
            });
        }

        report.TotalAssets = report.Assets.Sum(x => x.Amount);
        report.TotalLiabilities = report.Liabilities.Sum(x => x.Amount);
        report.TotalEquity = report.Equity.Sum(x => x.Amount);

        return report;
    }
}
