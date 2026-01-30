using System;
using System.Collections.Generic;

namespace CompreoBooks.Application.Features.Sales.DTOs;

public class EstimateDto
{
    public Guid Id { get; set; }
    public string EstimateNumber { get; set; } = string.Empty;
    public string ReferenceNumber { get; set; } = string.Empty;
    public DateTime EstimateDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }

    public string Status { get; set; } = string.Empty;
    public string ApprovalStatus { get; set; } = string.Empty;

    public string? TermsAndConditions { get; set; }
    public string? CustomerNotes { get; set; }
    public Guid? PublicViewToken { get; set; }
    
    public string? PlaceOfSupply { get; set; }
    public string? Salesperson { get; set; }
    public string? ProjectName { get; set; }
    public decimal ShippingCharges { get; set; }
    public decimal Adjustment { get; set; }

    public bool NegotiationAllowed { get; set; }
    public string? CustomerRemarks { get; set; }

    public List<EstimateItemDto> Items { get; set; } = new();
}

public class EstimateItemDto
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

public class CreateEstimateDto
{
    public Guid CustomerId { get; set; }
    public string? ReferenceNumber { get; set; }
    public DateTime EstimateDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public string? TermsAndConditions { get; set; }
    public string? CustomerNotes { get; set; }
    
    public string? PlaceOfSupply { get; set; }
    public string? Salesperson { get; set; }
    public string? ProjectName { get; set; }
    public decimal ShippingCharges { get; set; }
    public decimal Adjustment { get; set; }
    public decimal? TaxAmount { get; set; }
    
    public bool NegotiationAllowed { get; set; }
    public string? CustomerRemarks { get; set; }

    public List<CreateEstimateItemDto> Items { get; set; } = new();
}

public class CreateEstimateItemDto
{
    public Guid ItemId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public decimal TaxRate { get; set; }
}
