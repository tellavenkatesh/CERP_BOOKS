using System;
using System.ComponentModel.DataAnnotations;

namespace CompreoBooks.Domain.Entities.Masters;

public class NumberingSeries
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string EntityName { get; set; } = string.Empty; // e.g., "Invoice", "Bill"

    [MaxLength(20)]
    public string Prefix { get; set; } = string.Empty;

    public int StartingNumber { get; set; }

    public int LastUsedNumber { get; set; }

    [MaxLength(20)]
    public string Suffix { get; set; } = string.Empty;

    public bool IsDefault { get; set; }

    public bool IsActive { get; set; } = true;

    public int PaddingLength { get; set; } = 4;

    public ResetFrequency ResetFrequency { get; set; } = ResetFrequency.Never;
}

public enum ResetFrequency
{
    Never = 0,
    Yearly = 1,
    Monthly = 2
}
