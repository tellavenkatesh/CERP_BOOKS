using System;

namespace CompreoBooks.Application.Features.Reports.Queries;

public class OrderStatusEntryDto
{
    public string OrderNo { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string PartyName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? DeliveryDate { get; set; }
}

public class GrnReportEntryDto
{
    public string GrnNo { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public string PoNo { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class GstReportEntryDto
{
    public string GstIn { get; set; } = string.Empty;
    public string PartyName { get; set; } = string.Empty;
    public string InvoiceNo { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public decimal TaxableValue { get; set; }
    public decimal Igst { get; set; }
    public decimal Cgst { get; set; }
    public decimal Sgst { get; set; }
    public decimal TotalTax { get; set; }
}

public class TdsReportEntryDto
{
    public string Section { get; set; } = string.Empty;
    public string PartyName { get; set; } = string.Empty;
    public decimal PaymentAmount { get; set; }
    public decimal TdsRate { get; set; }
    public decimal TdsDeducted { get; set; }
    public DateTime PaymentDate { get; set; }
}

public class DashboardDto
{
    public decimal TotalRevenue { get; set; }
    public decimal RevenueGrowth { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal ExpenseGrowth { get; set; }
    public decimal TotalReceivables { get; set; }
    public decimal OverdueReceivables { get; set; }
    public decimal TotalPayables { get; set; }
    public decimal UpcomingPayables { get; set; }
    public List<TrendPoint> RevenueTrend { get; set; } = new();
    public List<ExpenseCategoryPoint> ExpenseBreakdown { get; set; } = new();
    public List<ActivityItem> RecentActivity { get; set; } = new();
}

public class TrendPoint
{
    public string Month { get; set; } = string.Empty;
    public decimal Sales { get; set; }
    public decimal Expenses { get; set; }
}

public class ExpenseCategoryPoint
{
    public string Name { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public string Color { get; set; } = string.Empty;
}

public class ActivityItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Type { get; set; } = string.Empty; // Invoice, Payment, Order
    public string Message { get; set; } = string.Empty;
    public DateTime Time { get; set; }
    public string Amount { get; set; } = string.Empty;
}
