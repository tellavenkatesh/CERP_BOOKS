using System;
using System.ComponentModel.DataAnnotations;

namespace CompreoBooks.Domain.Entities.Masters;

public class PaymentTerm
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public int Days { get; set; }

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}
