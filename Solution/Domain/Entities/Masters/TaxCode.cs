using System;
using System.ComponentModel.DataAnnotations;

namespace CompreoBooks.Domain.Entities.Masters;


public enum TaxType
{
    GstOutput,
    GstInput,
    SalesTax,
    Vat,
    Other
}

public class TaxCode
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public string Name { get; set; } = string.Empty; // e.g., "GST 18%", "TDS 10%"
    
    [Required]
    public string Code { get; set; } = string.Empty; // e.g., "GST18", "TDS10"
    
    public decimal Rate { get; set; } // Percentage, e.g., 18.00
    
    public bool IsTds { get; set; } = false; // Flag to distinguish TDS from GST/VAT
    public TaxType TaxType { get; set; } = TaxType.GstOutput;

    public Guid? PayableAccountId { get; set; }
    public Guid? ReceivableAccountId { get; set; }
    
    public string Description { get; set; } = string.Empty;
    
    public bool IsActive { get; set; } = true;
}
