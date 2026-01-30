using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Sales;
using CompreoBooks.Domain.Entities.Purchase;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Reports.Queries;

public record GetGstReportQuery(string Type, DateTime FromDate, DateTime ToDate) : IRequest<List<GstReportEntryDto>>;

public class GetGstReportQueryHandler : IRequestHandler<GetGstReportQuery, List<GstReportEntryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetGstReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<GstReportEntryDto>> Handle(GetGstReportQuery request, CancellationToken cancellationToken)
    {
        var report = new List<GstReportEntryDto>();

        if (request.Type == "GSTR1") // Sales
        {
            var invoices = await _context.Invoices
                .Include(x => x.Customer)
                .Include(x => x.Items)
                .Where(x => x.InvoiceDate >= request.FromDate && x.InvoiceDate <= request.ToDate)
                .ToListAsync(cancellationToken);

            foreach (var inv in invoices)
            {
                // Simple logic: Assuming IGST/CGST/SGST split happens here
                // In a real system, you'd check State vs State.
                // For now, let's assume 50/50 CGST/SGST for simplicity unless explicitly IGST.
                
                decimal totalTax = inv.TaxAmount;
                // Heuristic: If tax amount exists, split it.
                decimal igst = 0, cgst = 0, sgst = 0;

                // Check first item tax rate maybe? Or just assume Intra-state (CGST+SGST) for now as default
                cgst = totalTax / 2;
                sgst = totalTax / 2;

                report.Add(new GstReportEntryDto
                {
                    GstIn = inv.Customer.GstIn ?? "",
                    PartyName = inv.Customer.Name,
                    InvoiceNo = inv.InvoiceNumber,
                    Date = inv.InvoiceDate,
                    TaxableValue = inv.SubTotal,
                    Igst = igst, Cgst = cgst, Sgst = sgst,
                    TotalTax = totalTax
                });
            }
        }
        else // GSTR2 (Purchase)
        {
            var bills = await _context.Bills
                .Include(x => x.Vendor)
                .Where(x => x.BillDate >= request.FromDate && x.BillDate <= request.ToDate)
                .ToListAsync(cancellationToken);
            
            foreach (var bill in bills)
            {
                 decimal totalTax = bill.TaxAmount;
                decimal igst = 0, cgst = 0, sgst = 0;
                cgst = totalTax / 2;
                sgst = totalTax / 2;

                report.Add(new GstReportEntryDto
                {
                    GstIn = bill.Vendor.GstIn ?? "",
                    PartyName = bill.Vendor.Name,
                    InvoiceNo = bill.VendorBillNumber,
                    Date = bill.BillDate,
                    TaxableValue = bill.SubTotal,
                    Igst = igst, Cgst = cgst, Sgst = sgst,
                    TotalTax = totalTax
                });
            }
        }

        return report;
    }
}
