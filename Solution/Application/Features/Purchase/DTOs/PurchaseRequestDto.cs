using System;
using System.Collections.Generic;

namespace CompreoBooks.Application.Features.Purchase.DTOs;

public class PurchaseRequestDto
{
    public Guid Id { get; set; }
    public string RequestNumber { get; set; } = string.Empty;
    public DateTime RequestDate { get; set; }
    public DateTime? RequiredDate { get; set; } 
    public string RequestedBy { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty; // Renamed from Description
    public string Department { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int Priority { get; set; }
    public string? ApprovedBy { get; set; }
    public string? Remarks { get; set; }
    
    public List<PurchaseRequestItemDto> Items { get; set; } = new();
}

public class PurchaseRequestItemDto
{
    public Guid Id { get; set; }
    public Guid ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty; // From Item Master
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal EstimatedRate { get; set; }
    public decimal EstimatedAmount { get; set; }
}

public class CreatePurchaseRequestDto
{
    public DateTime? RequiredDate { get; set; } // Optional now
    public string RequestedBy { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty; // Renamed from Description
    public string Department { get; set; } = string.Empty;
    public int Priority { get; set; } // 0=Low, 1=Medium, 2=High
    
    public List<CreatePurchaseRequestItemDto> Items { get; set; } = new();
}

public class CreatePurchaseRequestItemDto
{
    public Guid ItemId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal EstimatedRate { get; set; }
}
