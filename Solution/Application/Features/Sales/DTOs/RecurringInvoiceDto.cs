using System;
using System.Collections.Generic;

namespace CompreoBooks.Application.Features.Sales.DTOs;

public class RecurringInvoiceDto
{
    public Guid Id { get; set; }
    public string ProfileName { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string Interval { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime? LastRunDate { get; set; }
    public DateTime NextRunDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentTerms { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public List<RecurringInvoiceItemDto> Items { get; set; } = new();
}

public class RecurringInvoiceItemDto
{
    public Guid Id { get; set; }
    public Guid ItemId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Amount { get; set; }
}
