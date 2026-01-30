using System;
using System.Collections.Generic;

namespace CompreoBooks.Application.Features.Sales.DTOs;

public class InvoiceDto
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public DateTime DueDate { get; set; }
    
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    
    public Guid? SalesOrderId { get; set; }
    public string? SalesOrderNumber { get; set; }

    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TotalCgstAmount { get; set; }
    public decimal TotalSgstAmount { get; set; }
    public decimal TotalIgstAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal BalanceAmount { get; set; }

    public string Status { get; set; } = string.Empty;

    public List<InvoiceLineDto> Items { get; set; } = new();
}

public class InvoiceLineDto
{
    public Guid Id { get; set; }
    public Guid ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal Amount { get; set; }
    public decimal CgstAmount { get; set; }
    public decimal SgstAmount { get; set; }
    public decimal IgstAmount { get; set; }
}

// CreateInvoiceDto and CreateInvoiceLineDto moved to CreateInvoiceCommand.cs or kept here?
// Best Practice: Keep DTOs in DTO files.
// Additional fix: Revert defining them in Command file, and Update InvoiceDto.cs instead.
// But I already updated Command file. 
// So I will remove them from InvoiceDto.cs to fix the duplicate.
