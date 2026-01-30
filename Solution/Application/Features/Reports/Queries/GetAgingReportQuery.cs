using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Purchase;
using CompreoBooks.Domain.Entities.Sales;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Reports.Queries;

public enum AgingReportType
{
    Receivable, // Customers / Invoices
    Payable     // Vendors / Bills
}

public record GetAgingReportQuery(AgingReportType Type, DateTime AsOfDate) : IRequest<AgingReportDto>;

public class AgingReportDto
{
    public AgingReportType Type { get; set; }
    public DateTime AsOfDate { get; set; }
    public List<AgingLineDto> Lines { get; set; } = new();
    public decimal TotalDue { get; set; } // Grand Total
}

public class AgingLineDto
{
    public Guid PartyId { get; set; }
    public string PartyName { get; set; } = string.Empty;
    
    public decimal Current { get; set; } // 0-30 days
    public decimal Days31To60 { get; set; }
    public decimal Days61To90 { get; set; }
    public decimal Days90Plus { get; set; }
    public decimal Total { get; set; }
}

public class GetAgingReportQueryHandler : IRequestHandler<GetAgingReportQuery, AgingReportDto>
{
    private readonly IApplicationDbContext _context;

    public GetAgingReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AgingReportDto> Handle(GetAgingReportQuery request, CancellationToken cancellationToken)
    {
        var response = new AgingReportDto
        {
            Type = request.Type,
            AsOfDate = request.AsOfDate
        };

        if (request.Type == AgingReportType.Receivable)
        {
            var invoices = await _context.Invoices
                .Include(x => x.Customer)
                .Where(x => x.Status != InvoiceStatus.Paid && x.Status != InvoiceStatus.Cancelled && x.InvoiceDate <= request.AsOfDate)
                .ToListAsync(cancellationToken);

            // Group by Customer and Calculate
            var grouped = invoices.GroupBy(x => new { x.CustomerId, x.Customer.Name });

            foreach (var g in grouped)
            {
                var line = CalculateAging(g.Key.CustomerId, g.Key.Name, g.Select(x => new AgingItem 
                { 
                    DueDate = x.DueDate, 
                    Balance = x.TotalAmount - x.PaidAmount 
                }), request.AsOfDate);
                
                if (line.Total > 0) response.Lines.Add(line);
            }
        }
        else // Payable
        {
            var bills = await _context.Bills
                .Include(x => x.Vendor)
                .Where(x => x.Status != BillStatus.Paid && x.Status != BillStatus.Void && x.BillDate <= request.AsOfDate)
                .ToListAsync(cancellationToken);

            var grouped = bills.GroupBy(x => new { x.VendorId, x.Vendor.Name });
            
            foreach (var g in grouped)
            {
                var line = CalculateAging(g.Key.VendorId, g.Key.Name, g.Select(x => new AgingItem 
                { 
                    DueDate = x.DueDate, 
                    Balance = x.TotalAmount - x.PaidAmount 
                }), request.AsOfDate);

                if (line.Total > 0) response.Lines.Add(line);
            }
        }

        response.TotalDue = response.Lines.Sum(x => x.Total);
        return response;
    }

    private AgingLineDto CalculateAging(Guid partyId, string partyName, IEnumerable<AgingItem> items, DateTime asOfDate)
    {
        var line = new AgingLineDto { PartyId = partyId, PartyName = partyName };

        foreach (var item in items)
        {
            var daysOverdue = (asOfDate - item.DueDate).Days;
            
            // "Current" implies not yet due OR due within last 30 days?
            // Usually Aging buckets based on "Days Past Due".
            // If DueDate is in future, it's "Current" (or not overdue).
            // Let's assume bucket 0-30 includes future due dates + up to 30 days past due?
            // Standard convention: 
            // Current (Not Overdue)
            // 1-30 Days Overdue
            // 31-60 Days Overdue
            // etc.
            // But user request just said "Ageing Reports".
            // I'll stick to simple 30 day buckets based on (AsOf - DueDate).
            // If AsOf < DueDate, days is negative. Treat as "Current".
            
            // Refined Logic:
            // Current: Not Overdue (daysOverdue <= 0)
            // 1-30: daysOverdue 1 to 30
            // 31-60: daysOverdue 31 to 60
            // ...

            if (daysOverdue <= 30)
            {
                line.Current += item.Balance;
            }
            else if (daysOverdue > 30 && daysOverdue <= 60)
            {
                line.Days31To60 += item.Balance;
            }
            else if (daysOverdue > 60 && daysOverdue <= 90)
            {
                line.Days61To90 += item.Balance;
            }
            else
            {
                line.Days90Plus += item.Balance;
            }
        }
        
        line.Total = line.Current + line.Days31To60 + line.Days61To90 + line.Days90Plus;
        return line;
    }

    private class AgingItem
    {
        public DateTime DueDate { get; set; }
        public decimal Balance { get; set; }
    }
}
