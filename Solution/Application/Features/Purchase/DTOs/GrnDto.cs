using System;
using System.Collections.Generic;

namespace CompreoBooks.Application.Features.Purchase.DTOs;

public class GrnDto
{
    public Guid Id { get; set; }
    public string GrnNumber { get; set; } = string.Empty;
    public DateTime GrnDate { get; set; }
    
    public Guid VendorId { get; set; }
    public string VendorName { get; set; } = string.Empty;

    public Guid? PurchaseOrderId { get; set; }
    public string PurchaseOrderNumber { get; set; } = string.Empty;

    public string VendorInvoiceNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;

    public List<GrnItemDto> Items { get; set; } = new();
}

public class GrnItemDto
{
    public Guid Id { get; set; }
    public Guid ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
}

public class CreateGrnDto
{
    public Guid VendorId { get; set; }
    public Guid? PurchaseOrderId { get; set; }
    public DateTime GrnDate { get; set; }
    public string VendorInvoiceNumber { get; set; } = string.Empty;
    
    public List<CreateGrnItemDto> Items { get; set; } = new();
}

public class CreateGrnItemDto
{
    public Guid ItemId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
}
