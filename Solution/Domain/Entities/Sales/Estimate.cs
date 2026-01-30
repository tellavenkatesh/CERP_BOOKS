using System;
using System.Collections.Generic;
using CompreoBooks.Domain.Entities.Masters;

namespace CompreoBooks.Domain.Entities.Sales;

public enum EstimateStatus
{
    Draft = 0,
    Sent = 1,
    Accepted = 2,
    Rejected = 3,
    ConvertedToOrder = 4,
    Expired = 5,
    Declined = 6,
    NegotiationRequested = 7
}

public class Estimate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string EstimateNumber { get; set; } = string.Empty;
    public string ReferenceNumber { get; set; } = string.Empty;
    public DateTime EstimateDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    
    public Guid CustomerId { get; set; }
    public Party Customer { get; set; } = null!;

    public string? TermsAndConditions { get; set; }
    public string? CustomerNotes { get; set; }

    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }

    public EstimateStatus Status { get; set; } = EstimateStatus.Draft;
    public ApprovalStatus ApprovalStatus { get; set; } = ApprovalStatus.Pending;

    // Public View & Lifecycle
    public Guid? PublicViewToken { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? ViewedAt { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public DateTime? DeclinedAt { get; set; }
    public string? DeclineReason { get; set; }

    // Redesign Fields
    public string? PlaceOfSupply { get; set; }
    public string? Salesperson { get; set; }
    public string? ProjectName { get; set; }
    public decimal ShippingCharges { get; set; }
    public decimal Adjustment { get; set; }

    // Negotiation Fields
    public bool NegotiationAllowed { get; set; }
    public string? CustomerRemarks { get; set; }
    public Guid? BaseEstimateId { get; set; }

    public ICollection<EstimateItem> Items { get; set; } = new List<EstimateItem>();
}
