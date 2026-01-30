using System;

namespace CompreoBooks.Domain.Entities.Masters;

public enum ItemType
{
    Stock,
    NonStock,
    Service
}

public class Item
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // Identification
    public string Code { get; set; } = string.Empty; // SKU / item_code
    public string Name { get; set; } = string.Empty; // item_name
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // Kept for compatibility/reporting

    // Classification (Detailed)
    public ItemType Type { get; set; } = ItemType.Stock;
    public Guid? ItemGroupId { get; set; }
    public Guid? BrandId { get; set; }

    // Unit of Measure
    public string BaseUom { get; set; } = "Nos";
    public string? AlternateUom { get; set; }
    public decimal? UomConversionFactor { get; set; }

    // Inventory Control
    public bool TrackInventory { get; set; } = true;
    public decimal OpeningQuantity { get; set; }
    public decimal OpeningRate { get; set; }
    public decimal OpeningValue => OpeningQuantity * OpeningRate; // Computed
    public decimal CurrentStock { get; set; }
    
    // Stock Safety
    public decimal ReorderLevel { get; set; }

    // Pricing
    public decimal PurchasePrice { get; set; }
    public decimal SalesPrice { get; set; }
    public decimal DiscountPercentage { get; set; }

    // Taxation
    public Guid? TaxCodeId { get; set; }
    public string HsnSacCode { get; set; } = string.Empty;
    public bool TaxInclusive { get; set; } = false;
    public decimal TaxRate { get; set; } // De-normalized or Override

    // Accounting Mapping
    public Guid? PurchaseLedgerId { get; set; }
    public Guid? SalesLedgerId { get; set; }
    public Guid? InventoryLedgerId { get; set; }

    // Tracking
    public bool BatchTracking { get; set; } = false;
    public bool SerialTracking { get; set; } = false;
    public bool ExpiryTracking { get; set; } = false;

    // Barcode & Reference
    public string Barcode { get; set; } = string.Empty;
    public string ManufacturerCode { get; set; } = string.Empty;

    // Status
    public bool IsActive { get; set; } = true;
    
    // Audit
    public DateTime Created { get; set; } = DateTime.UtcNow;
    public DateTime? LastModified { get; set; }
}
