using System;
using System.Collections.Generic;

namespace CompreoBooks.Application.Features.Sales.DTOs;

public class SalesOrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerPONumber { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TotalCgstAmount { get; set; }
    public decimal TotalSgstAmount { get; set; }
    public decimal TotalIgstAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string OrderType { get; set; } = string.Empty;
    public string DeliveryStatus { get; set; } = string.Empty;
    public string InvoiceStatus { get; set; } = string.Empty;
    public DateTime? SentAt { get; set; }
    public DateTime? ViewedAt { get; set; }
    public string ApprovalStatus { get; set; } = string.Empty;
    public string? DeliveryAddress { get; set; }
    public string? PaymentTerms { get; set; }
    public string? PlaceOfSupply { get; set; }
    public string? Salesperson { get; set; }
    public decimal ShippingCharges { get; set; }
    public decimal Adjustment { get; set; }
    public string? CustomerNotes { get; set; }
    public string? TermsAndConditions { get; set; }
    public List<SalesOrderItemDto> Items { get; set; } = new();
}

public class SalesOrderItemDto
{
    public Guid Id { get; set; }
    public Guid ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal CgstAmount { get; set; }
    public decimal SgstAmount { get; set; }
    public decimal IgstAmount { get; set; }
    public decimal QuantityDelivered { get; set; }
    public decimal QuantityInvoiced { get; set; }
}

public class CreateSalesOrderDto
{
    public Guid CustomerId { get; set; }
    public DateTime OrderDate { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public string? CustomerPONumber { get; set; }
    public string? DeliveryAddress { get; set; }
    public string? PaymentTerms { get; set; }
    public string? PlaceOfSupply { get; set; }
    public string? Salesperson { get; set; }
    public string? CustomerNotes { get; set; }
    public string? TermsAndConditions { get; set; }
    public decimal ShippingCharges { get; set; }
    public decimal Adjustment { get; set; }
    public string OrderType { get; set; } = "Standard"; // Standard, Service, GoodsAutoDC
    public List<CreateSalesOrderItemDto> Items { get; set; } = new();
}

public class CreateSalesOrderItemDto
{
    public Guid ItemId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TaxRate { get; set; }
}
