using System;

namespace CompreoBooks.Domain.Entities.Masters;

public class Company
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Pincode { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    
    // Tax Info
    public string TaxId { get; set; } = string.Empty; // GSTIN/VAT
    public string PanNumber { get; set; } = string.Empty;
    
    // Settings
    public string Currency { get; set; } = "INR";
    public DateTime FiscalYearStart { get; set; }
    public DateTime FiscalYearEnd { get; set; }
    public DateTime BooksOpeningDate { get; set; }
    public byte[]? Logo { get; set; }
    
    // Additional Info
    public string Industry { get; set; } = string.Empty;
    public string CompanyType { get; set; } = string.Empty;
    public bool EnableGST { get; set; }
    public bool EnableTDS { get; set; }
    
    // Period Lock
    public DateTime? PeriodLockDate { get; set; }
    public string PeriodLockReason { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
