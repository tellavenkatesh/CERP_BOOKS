using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Reports.Queries;

public record GetDayBookQuery(DateTime Date) : IRequest<List<DayBookEntryDto>>;

public class DayBookEntryDto
{
    public DateTime Date { get; set; }
    public string VoucherNo { get; set; } = string.Empty;
    public string VoucherType { get; set; } = string.Empty;
    public string Account { get; set; } = string.Empty;
    public string Narration { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class GetDayBookQueryHandler : IRequestHandler<GetDayBookQuery, List<DayBookEntryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetDayBookQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<DayBookEntryDto>> Handle(GetDayBookQuery request, CancellationToken cancellationToken)
    {
        var entries = await _context.JournalEntries
            .Include(x => x.Lines)
            .ThenInclude(x => x.Account)
            .Where(x => x.JournalDate.Date == request.Date.Date)
            .OrderBy(x => x.JournalNumber)
            .ToListAsync(cancellationToken);

        var report = new List<DayBookEntryDto>();

        foreach (var entry in entries)
        {
            // Simple logic: Amount is total debits
            decimal amount = entry.Lines.Sum(x => x.DebitAmount);
            
            // Account names involved (limit to avoid too long string)
            var accountNames = entry.Lines.Select(x => x.Account.Name).Distinct().ToList();
            string accountsStr = accountNames.Count > 3 
                ? $"{string.Join(", ", accountNames.Take(3))}, ..." 
                : string.Join(", ", accountNames);

            report.Add(new DayBookEntryDto
            {
                Date = entry.JournalDate,
                VoucherNo = entry.JournalNumber,
                VoucherType = "Journal Entry", // Determine type if possible, or generic
                Narration = entry.Narration,
                Account = accountsStr,
                Amount = amount
            });
        }

        return report;
    }
}
