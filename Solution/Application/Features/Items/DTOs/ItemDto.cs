using CompreoBooks.Domain.Entities.Masters;
using System;

namespace CompreoBooks.Application.Features.Items.DTOs;

public class ItemDto
{
    public Guid Id { get; set; }
    
    // Identification
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // Classification
    public string Type { get; set; } = string.Empty;
    public Guid? ItemGroupId { get; set; }
    public Guid? BrandId { get; set; }

    // UOM
    public string BaseUom { get; set; } = "Nos";
    public string? AlternateUom { get; set; }
    public decimal? UomConversionFactor { get; set; }

    // Inventory
    public bool TrackInventory { get; set; }
    public decimal OpeningQuantity { get; set; }
    public decimal OpeningRate { get; set; }
    public decimal OpeningValue { get; set; }
    public decimal ReorderLevel { get; set; }
    public decimal CurrentStock { get; set; } // Calculated/Hand

    // Pricing
    public decimal PurchasePrice { get; set; }
    public decimal SalesPrice { get; set; }
    public decimal DiscountPercentage { get; set; }

    // Tax
    public Guid? TaxCodeId { get; set; }
    public string HsnSacCode { get; set; } = string.Empty;
    public bool TaxInclusive { get; set; }
    public decimal TaxRate { get; set; }

    // Ledger
    public Guid? PurchaseLedgerId { get; set; }
    public Guid? SalesLedgerId { get; set; }
    public Guid? InventoryLedgerId { get; set; }

    // Control
    public bool BatchTracking { get; set; }
    public bool SerialTracking { get; set; }
    public bool ExpiryTracking { get; set; }
    public string Barcode { get; set; } = string.Empty;
    public string ManufacturerCode { get; set; } = string.Empty;

    public bool IsActive { get; set; }
}

public class CreateItemDto
{
    // Identification
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // Classification
    public int Type { get; set; } // 0=Stock, 1=NonStock, 2=Service
    public Guid? ItemGroupId { get; set; }
    public Guid? BrandId { get; set; }

    // UOM
    public string BaseUom { get; set; } = "Nos";
    public string? AlternateUom { get; set; }
    public decimal? UomConversionFactor { get; set; }

    // Inventory
    public bool TrackInventory { get; set; } = true;
    public decimal OpeningQuantity { get; set; }
    public decimal OpeningRate { get; set; }
    public decimal ReorderLevel { get; set; }

    // Pricing
    public decimal PurchasePrice { get; set; }
    public decimal SalesPrice { get; set; }
    public decimal DiscountPercentage { get; set; }

    // Tax
    public Guid? TaxCodeId { get; set; }
    public string HsnSacCode { get; set; } = string.Empty;
    public bool TaxInclusive { get; set; }
    public decimal TaxRate { get; set; }

    // Ledger
    public Guid? PurchaseLedgerId { get; set; }
    public Guid? SalesLedgerId { get; set; }
    public Guid? InventoryLedgerId { get; set; }

    // Control
    public bool BatchTracking { get; set; }
    public bool SerialTracking { get; set; }
    public bool ExpiryTracking { get; set; }
    public string Barcode { get; set; } = string.Empty;
    public string ManufacturerCode { get; set; } = string.Empty;
}
