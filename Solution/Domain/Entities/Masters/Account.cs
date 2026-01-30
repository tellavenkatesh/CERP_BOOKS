using System;

namespace CompreoBooks.Domain.Entities.Masters;

public enum AccountType
{
    Asset,
    Liability,
    Equity,
    Income,
    Expense
}

public class Account
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty; // GL Code
    public AccountType Type { get; set; }
    public string? ParentAccountId { get; set; } // For hierarchy
    public string? Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public bool IsSystem { get; set; } = false; // Cannot be deleted if true
    
    // Tax related
    public bool IsTaxAccount { get; set; }
    
    public decimal OpeningBalance { get; set; }
    public decimal CurrentBalance { get; set; } // Calculated/Cached
}
