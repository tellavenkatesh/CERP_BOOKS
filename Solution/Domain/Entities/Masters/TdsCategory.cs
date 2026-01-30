using System;
using System.ComponentModel.DataAnnotations;

namespace CompreoBooks.Domain.Entities.Masters;

public class TdsCategory
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string Code { get; set; } = string.Empty; // e.g., "194C"

    [Required]
    public string Name { get; set; } = string.Empty; // e.g., "Contractors"

    public decimal Rate { get; set; } // e.g., 1.00 or 2.00
    
    public decimal ThresholdAmount { get; set; } // e.g., 30000 or 100000

    public string Description { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}
