using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Purchase;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Reports.Queries;

public record GetGrnReportQuery : IRequest<List<GrnReportEntryDto>>;

public class GetGrnReportQueryHandler : IRequestHandler<GetGrnReportQuery, List<GrnReportEntryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetGrnReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<GrnReportEntryDto>> Handle(GetGrnReportQuery request, CancellationToken cancellationToken)
    {
        var grns = await _context.Grns
            .Include(x => x.Vendor)
            .Include(x => x.PurchaseOrder)
            .OrderByDescending(x => x.GrnDate)
            .ToListAsync(cancellationToken);

        return grns.Select(x => new GrnReportEntryDto
        {
            GrnNo = x.GrnNumber,
            Date = x.GrnDate,
            VendorName = x.Vendor.Name,
            PoNo = x.PurchaseOrder?.OrderNumber ?? "-",
            Status = x.Status.ToString()
        }).ToList();
    }
}
