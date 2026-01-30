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

public record GetCashFlowStatementQuery(DateTime FromDate, DateTime ToDate) : IRequest<CashFlowStatementDto>;

public class CashFlowStatementDto
{
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    
    public List<CashFlowEntryDto> OperatingActivities { get; set; } = new();
    public List<CashFlowEntryDto> InvestingActivities { get; set; } = new();
    public List<CashFlowEntryDto> FinancingActivities { get; set; } = new();
    
    public decimal NetCashFlow { get; set; }
}

public class CashFlowEntryDto
{
    public string Category { get; set; } = string.Empty; // Operating, Investing, Financing
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class GetCashFlowStatementQueryHandler : IRequestHandler<GetCashFlowStatementQuery, CashFlowStatementDto>
{
    private readonly IApplicationDbContext _context;

    public GetCashFlowStatementQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CashFlowStatementDto> Handle(GetCashFlowStatementQuery request, CancellationToken cancellationToken)
    {
        // 1. Identify Cash and Bank Accounts
        var allAccounts = await _context.Accounts.ToListAsync(cancellationToken);
        var cashAccountIds = allAccounts
            .Where(a => a.Type == AccountType.Asset && (a.Name.Contains("Cash", StringComparison.OrdinalIgnoreCase) || a.Name.Contains("Bank", StringComparison.OrdinalIgnoreCase)))
            .Select(a => a.Id)
            .ToList();

        // 2. Fetch Journal Entries involving Cash Accounts within period
        var cashEntries = await _context.JournalEntries
            .Include(x => x.Lines)
            .Where(x => x.JournalDate >= request.FromDate && x.JournalDate <= request.ToDate)
            .Where(x => x.Lines.Any(l => cashAccountIds.Contains(l.AccountId)))
            .ToListAsync(cancellationToken);

        var report = new CashFlowStatementDto
        {
            FromDate = request.FromDate,
            ToDate = request.ToDate
        };

        foreach (var entry in cashEntries)
        {
            // Determine Net Cash Impact of this entry
            // Debit to Cash = Inflow (+), Credit to Cash = Outflow (-)
            decimal cashImpact = 0;
            foreach (var line in entry.Lines)
            {
                if (cashAccountIds.Contains(line.AccountId))
                {
                    cashImpact += (line.DebitAmount - line.CreditAmount);
                }
            }

            if (cashImpact == 0) continue;

            // Classify based on Counterpart accounts
            var counterpartLines = entry.Lines.Where(l => !cashAccountIds.Contains(l.AccountId)).ToList();
            if (!counterpartLines.Any()) continue; // Cash to Cash transfer? Ignore for net flow? Or Internal? ignoring for report.

            // Simplistic classification based on the first counterpart or majority
            var mainCounterpart = counterpartLines.OrderByDescending(l => l.DebitAmount + l.CreditAmount).First();
            var accountId = mainCounterpart.AccountId;
            var account = allAccounts.First(a => a.Id == accountId);

            string category = "Operating";
            string description = account.Name;

            // Heuristics
            if (account.Type == AccountType.Income)
            {
                category = "Operating";
                description = $"Cash from {account.Name}";
            }
            else if (account.Type == AccountType.Expense)
            {
                category = "Operating";
                description = $"Cash paid for {account.Name}";
            }
            else if (account.Type == AccountType.Liability)
            {
                 // Loan? Financing. Payables? Operating.
                 if (account.Name.Contains("Loan", StringComparison.OrdinalIgnoreCase)) category = "Financing";
                 else category = "Operating"; // Payables
                 description = $"Payment/Receipt - {account.Name}";
            }
            else if (account.Type == AccountType.Equity)
            {
                category = "Financing";
                description = $"Capital/Drawings - {account.Name}";
            }
            else if (account.Type == AccountType.Asset)
            {
                // Unsure if Current or Fixed.
                if (account.Name.Contains("Machine") || account.Name.Contains("Equipment") || account.Name.Contains("Furniture") || account.Name.Contains("Vehicle"))
                {
                    category = "Investing";
                    description = $"Purc/Sale of {account.Name}";
                }
                else
                {
                    category = "Operating"; // Receivables
                    description = $"Collection/Refund - {account.Name}";
                }
            }

            var dto = new CashFlowEntryDto { Category = category, Description = description, Amount = cashImpact };

            if (category == "Operating") report.OperatingActivities.Add(dto);
            else if (category == "Investing") report.InvestingActivities.Add(dto);
            else if (category == "Financing") report.FinancingActivities.Add(dto);
        }

        // Aggregate by Description to shorten report
        report.OperatingActivities = AggregateEntries(report.OperatingActivities);
        report.InvestingActivities = AggregateEntries(report.InvestingActivities);
        report.FinancingActivities = AggregateEntries(report.FinancingActivities);

        report.NetCashFlow = report.OperatingActivities.Sum(x => x.Amount) 
                           + report.InvestingActivities.Sum(x => x.Amount) 
                           + report.FinancingActivities.Sum(x => x.Amount);

        return report;
    }

    private List<CashFlowEntryDto> AggregateEntries(List<CashFlowEntryDto> entries)
    {
        return entries
            .GroupBy(x => x.Description)
            .Select(g => new CashFlowEntryDto
            {
                Category = g.First().Category,
                Description = g.Key,
                Amount = g.Sum(x => x.Amount)
            })
            .Where(x => x.Amount != 0)
            .ToList();
    }
}
