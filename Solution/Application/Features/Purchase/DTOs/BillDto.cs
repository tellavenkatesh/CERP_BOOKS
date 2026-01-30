using System;
using System.Collections.Generic;

namespace CompreoBooks.Application.Features.Purchase.DTOs;

public class BillDto
{
    public Guid Id { get; set; }
    public string BillNumber { get; set; } = string.Empty;
    public string VendorBillNumber { get; set; } = string.Empty;
    public DateTime BillDate { get; set; }
    public DateTime DueDate { get; set; }
    
    public Guid VendorId { get; set; }
    public string VendorName { get; set; } = string.Empty;

    public Guid? PurchaseOrderId { get; set; }
    public string PurchaseOrderNumber { get; set; } = string.Empty;
    
    public Guid? GrnId { get; set; }
    public string GrnNumber { get; set; } = string.Empty;

    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    
    public decimal TdsRate { get; set; }
    public decimal TdsAmount { get; set; }
    public decimal NetPayable { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal BalanceAmount { get; set; }

    public string Status { get; set; } = string.Empty;
    public string MatchStatus { get; set; } = string.Empty;

    public List<BillLineDto> Items { get; set; } = new();
}

public class BillLineDto
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
}

public class CreateBillDto
{
    public Guid VendorId { get; set; }
    public Guid? PurchaseOrderId { get; set; }
    public Guid? GrnId { get; set; }
    public string VendorBillNumber { get; set; } = string.Empty;
    public DateTime BillDate { get; set; }
    public DateTime DueDate { get; set; }
    
    public string? TdsCategory { get; set; }
    public decimal TdsRate { get; set; }
    
    public List<CreateBillLineDto> Items { get; set; } = new();
}

public class CreateBillLineDto
{
    public Guid ItemId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public decimal TaxRate { get; set; }
}
