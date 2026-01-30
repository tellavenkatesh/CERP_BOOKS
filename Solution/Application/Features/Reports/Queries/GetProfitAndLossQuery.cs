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

public record GetProfitAndLossQuery(DateTime FromDate, DateTime ToDate) : IRequest<ProfitAndLossDto>;

public class ProfitAndLossDto
{
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public List<PnLAccountDto> IncomeAccounts { get; set; } = new();
    public List<PnLAccountDto> ExpenseAccounts { get; set; } = new();
    public decimal TotalIncome { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal NetProfit { get; set; }
}

public class PnLAccountDto
{
    public Guid AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class GetProfitAndLossQueryHandler : IRequestHandler<GetProfitAndLossQuery, ProfitAndLossDto>
{
    private readonly IApplicationDbContext _context;

    public GetProfitAndLossQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ProfitAndLossDto> Handle(GetProfitAndLossQuery request, CancellationToken cancellationToken)
    {
        var accounts = await _context.Accounts
            .Where(x => x.Type == AccountType.Income || x.Type == AccountType.Expense)
            .ToListAsync(cancellationToken);

        // Fetch transactions within period
        var balances = await _context.JournalEntryLines
            .Include(x => x.JournalEntry)
            .Where(x => x.JournalEntry.JournalDate >= request.FromDate && x.JournalEntry.JournalDate <= request.ToDate)
            .Where(x => accounts.Select(a => a.Id).Contains(x.AccountId))
            .GroupBy(x => x.AccountId)
            .Select(g => new
            {
                AccountId = g.Key,
                TotalDebit = g.Sum(x => x.DebitAmount),
                TotalCredit = g.Sum(x => x.CreditAmount)
            })
            .ToListAsync(cancellationToken);

        var report = new ProfitAndLossDto
        {
            FromDate = request.FromDate,
            ToDate = request.ToDate
        };

        foreach (var account in accounts)
        {
            var bal = balances.FirstOrDefault(x => x.AccountId == account.Id);
            decimal debit = bal?.TotalDebit ?? 0;
            decimal credit = bal?.TotalCredit ?? 0;

            if (account.Type == AccountType.Income)
            {
                // Income is Credit nature
                decimal amount = credit - debit;
                if (amount != 0)
                {
                    report.IncomeAccounts.Add(new PnLAccountDto
                    {
                        AccountId = account.Id,
                        AccountName = account.Name,
                        Amount = amount
                    });
                }
            }
            else if (account.Type == AccountType.Expense)
            {
                // Expense is Debit nature
                decimal amount = debit - credit;
                if (amount != 0)
                {
                    report.ExpenseAccounts.Add(new PnLAccountDto
                    {
                        AccountId = account.Id,
                        AccountName = account.Name,
                        Amount = amount
                    });
                }
            }
        }

        report.TotalIncome = report.IncomeAccounts.Sum(x => x.Amount);
        report.TotalExpense = report.ExpenseAccounts.Sum(x => x.Amount);
        report.NetProfit = report.TotalIncome - report.TotalExpense;

        return report;
    }
}
