using System;
using System.Collections.Generic;

namespace CompreoBooks.Application.Features.Purchase.DTOs;

public class PurchaseOrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    
    public Guid VendorId { get; set; }
    public string VendorName { get; set; } = string.Empty;
    
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;
    public string PaymentTerms { get; set; } = string.Empty;
    public string ShipmentPreference { get; set; } = string.Empty;
    public string DeliveryAddress { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string TermsAndConditions { get; set; } = string.Empty;
    
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Adjustment { get; set; }

    public string OrderType { get; set; } = string.Empty;
    public string ApprovalStatus { get; set; } = string.Empty;
    public Guid? PurchaseRequestId { get; set; }

    public List<PurchaseOrderItemDto> Items { get; set; } = new();
}

public class PurchaseOrderItemDto
{
    public Guid Id { get; set; }
    public Guid ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal ReceivedQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public Guid? AccountId { get; set; }
    public Guid? TaxId { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
}

public class CreatePurchaseOrderDto
{
    public Guid VendorId { get; set; }
    public DateTime OrderDate { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public string DeliveryAddress { get; set; } = string.Empty;
    public string PaymentTerms { get; set; } = string.Empty;
    public string ShipmentPreference { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string TermsAndConditions { get; set; } = string.Empty;
    
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Adjustment { get; set; }
    public decimal TotalAmount { get; set; }

    public int OrderType { get; set; } // 0=Standard, 1=Service, 2=Blanket

    public Guid? PurchaseRequestId { get; set; } // Added Link
    
    public List<CreatePurchaseOrderItemDto> Items { get; set; } = new();
}

public class CreatePurchaseOrderItemDto
{
    public Guid ItemId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public Guid? AccountId { get; set; }
    public Guid? TaxId { get; set; }
    public decimal TaxRate { get; set; }
}
