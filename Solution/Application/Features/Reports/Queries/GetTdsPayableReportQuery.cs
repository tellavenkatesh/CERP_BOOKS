using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Reports.Queries;

public class TdsPayableEntryDto
{
    public string Section { get; set; } = string.Empty;
    public decimal TotalAmountPaid { get; set; }
    public decimal TotalTdsDeducted { get; set; }
    public decimal TdsDeposited { get; set; }
    public decimal BalancePayable { get; set; }
}

public record GetTdsPayableReportQuery(DateTime FromDate, DateTime ToDate) : IRequest<List<TdsPayableEntryDto>>;

public class GetTdsPayableReportQueryHandler : IRequestHandler<GetTdsPayableReportQuery, List<TdsPayableEntryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMediator _mediator;

    public GetTdsPayableReportQueryHandler(IApplicationDbContext context, IMediator mediator)
    {
        _context = context;
        _mediator = mediator;
    }

    public async Task<List<TdsPayableEntryDto>> Handle(GetTdsPayableReportQuery request, CancellationToken cancellationToken)
    {
        // Reuse the logic from GetTdsReportQuery effectively, or just re-implement
        // Since we don't have shared logic easily extractable without refactoring, I'll invoke the detail query and aggregate.
        
        var details = await _mediator.Send(new GetTdsReportQuery(request.FromDate, request.ToDate), cancellationToken);

        var grouped = details.GroupBy(x => x.Section);
        
        var report = grouped.Select(g => new TdsPayableEntryDto
        {
            Section = g.Key,
            TotalAmountPaid = g.Sum(x => x.PaymentAmount),
            TotalTdsDeducted = g.Sum(x => x.TdsDeducted),
            TdsDeposited = 0, // We have no tracking of "Deposit Challans" yet
            BalancePayable = g.Sum(x => x.TdsDeducted) // Assuming none deposited
        }).ToList();

        if (!report.Any())
        {
            // Return empty list
        }

        return report;
    }
}
