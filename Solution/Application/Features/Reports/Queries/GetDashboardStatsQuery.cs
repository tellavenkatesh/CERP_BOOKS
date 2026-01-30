using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using CompreoBooks.Domain.Entities.Financial;
using CompreoBooks.Domain.Entities.Sales;
using CompreoBooks.Domain.Entities.Purchase;

namespace CompreoBooks.Application.Features.Reports.Queries;

public record GetDashboardStatsQuery(DateTime? StartDate = null, DateTime? EndDate = null) : IRequest<DashboardDto>;

public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, DashboardDto>
{
    private readonly IApplicationDbContext _context;

    public GetDashboardStatsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        
        DateTime currentStart;
        DateTime currentEnd;
        DateTime previousStart;
        DateTime previousEnd;

        if (request.StartDate.HasValue && request.EndDate.HasValue)
        {
            // Custom Range
            currentStart = DateTime.SpecifyKind(request.StartDate.Value, DateTimeKind.Utc);
            currentEnd = DateTime.SpecifyKind(request.EndDate.Value, DateTimeKind.Utc).AddDays(1).AddTicks(-1); // End of day

            var daysDiff = (currentEnd - currentStart).Days + 1;
            previousEnd = currentStart.AddDays(-1);
            previousStart = previousEnd.AddDays(-daysDiff + 1);
        }
        else
        {
            // Default: This Month
            currentStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            currentEnd = currentStart.AddMonths(1).AddTicks(-1);
            
            previousStart = currentStart.AddMonths(-1);
            previousEnd = currentStart.AddTicks(-1);
        }

        var response = new DashboardDto();

        // 1. Revenue (Sales Invoices)
        // Adjust logic based on your exact definitions (e.g. Paid vs Posted). Using Posted for Accrual basis.
        // 1. Revenue (Sales Invoices)
        var thisMonthRevenue = await _context.Invoices
            .Where(i => i.InvoiceDate >= currentStart && i.InvoiceDate <= currentEnd && i.Status != InvoiceStatus.Draft && i.Status != InvoiceStatus.Void)
            .SumAsync(i => i.TotalAmount, cancellationToken);

        var lastMonthRevenue = await _context.Invoices
            .Where(i => i.InvoiceDate >= previousStart && i.InvoiceDate <= previousEnd && i.Status != InvoiceStatus.Draft && i.Status != InvoiceStatus.Void)
            .SumAsync(i => i.TotalAmount, cancellationToken);
            
        response.TotalRevenue = thisMonthRevenue;
        response.RevenueGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 100;

        // 2. Expenses (Bills)
        // 2. Expenses (Bills)
        var thisMonthExpenses = await _context.Bills
            .Where(b => b.BillDate >= currentStart && b.BillDate <= currentEnd && b.Status != BillStatus.Draft && b.Status != BillStatus.Void)
            .SumAsync(b => b.TotalAmount, cancellationToken);
            
        var lastMonthExpenses = await _context.Bills
            .Where(b => b.BillDate >= previousStart && b.BillDate <= previousEnd && b.Status != BillStatus.Draft && b.Status != BillStatus.Void)
            .SumAsync(b => b.TotalAmount, cancellationToken);

        response.TotalExpenses = thisMonthExpenses;
        response.ExpenseGrowth = lastMonthExpenses > 0 ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 100;

        // 3. Receivables
        var receivables = await _context.Invoices
            .Where(i => i.Status == InvoiceStatus.Posted || i.Status == InvoiceStatus.PartiallyPaid || i.Status == InvoiceStatus.Overdue)
            .ToListAsync(cancellationToken);
            
        response.TotalReceivables = receivables.Sum(i => i.BalanceAmount);
        response.OverdueReceivables = receivables.Where(i => i.DueDate < now).Sum(i => i.BalanceAmount);

        // 4. Payables
        var payables = await _context.Bills
            .Where(b => b.Status == BillStatus.Posted || b.Status == BillStatus.PartiallyPaid)
            .ToListAsync(cancellationToken);

        response.TotalPayables = payables.Sum(b => b.BalanceAmount);
        response.UpcomingPayables = payables.Where(b => b.DueDate >= now && b.DueDate <= now.AddDays(7)).Sum(b => b.BalanceAmount);

        // 5. Trend (Last 6 Months)
        for (int i = 5; i >= 0; i--)
        {
            var date = now.AddMonths(-i);
            var monthStart = new DateTime(date.Year, date.Month, 1);
            var monthEnd = monthStart.AddMonths(1).AddDays(-1);

             var sales = await _context.Invoices
                .Where(x => x.InvoiceDate >= monthStart && x.InvoiceDate <= monthEnd && x.Status != InvoiceStatus.Draft && x.Status != InvoiceStatus.Void)
                .SumAsync(x => x.TotalAmount, cancellationToken);

             var expenses = await _context.Bills
                .Where(x => x.BillDate >= monthStart && x.BillDate <= monthEnd && x.Status != BillStatus.Draft && x.Status != BillStatus.Void)
                .SumAsync(x => x.TotalAmount, cancellationToken);

            response.RevenueTrend.Add(new TrendPoint
            {
                Month = monthStart.ToString("MMM"),
                Sales = sales,
                Expenses = expenses
            });
        }

        // 6. Expense Breakdown (By Item Category or Account - Simplifying to use Account/Category if available, else Items)
        // Determine top 4 vendors as proxy to categories for now if Categories not populated on Bills
        var expenseItems = await _context.Bills
            .Include(b => b.Items).ThenInclude(i => i.Item)
            .Where(b => b.BillDate >= now.AddMonths(-6))
            .SelectMany(b => b.Items)
            .GroupBy(i => i.Item.Category ?? "Uncategorized")
            .Select(g => new { Name = g.Key, Value = g.Sum(x => x.Amount) })
            .OrderByDescending(x => x.Value)
            .Take(4)
            .ToListAsync(cancellationToken);

        string[] colors = new[] { "#3b82f6", "#10b981", "#f59e0b", "#ef4444" };
        int colorIdx = 0;
        foreach(var item in expenseItems)
        {
            response.ExpenseBreakdown.Add(new ExpenseCategoryPoint 
            { 
                Name = item.Name, 
                Value = item.Value, 
                Color = colors[colorIdx % colors.Length] 
            });
            colorIdx++;
        }

        // 7. Recent Activity (Mix of Invoices, Payments, New Orders)
        var recentInvoices = await _context.Invoices
            .OrderByDescending(x => x.Created)
            .Take(3)
            .Select(x => new ActivityItem { Id = x.Id, Type = "invoice", Message = $"Invoice #{x.InvoiceNumber} created", Time = x.Created, Amount = x.TotalAmount.ToString("C") })
            .ToListAsync(cancellationToken);

        var recentPayments = await _context.Payments
            .OrderByDescending(x => x.PaymentDate)
            .Take(3)
            .Select(x => new ActivityItem { Id = x.Id, Type = "payment", Message = $"Payment {x.PaymentNumber}", Time = x.PaymentDate, Amount = x.Amount.ToString("C") })
            .ToListAsync(cancellationToken);

        response.RecentActivity.AddRange(recentInvoices);
        response.RecentActivity.AddRange(recentPayments);
        response.RecentActivity = response.RecentActivity.OrderByDescending(x => x.Time).Take(5).ToList();

        return response;
    }
}
