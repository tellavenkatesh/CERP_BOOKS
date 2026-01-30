using System.ComponentModel.DataAnnotations;

namespace CompreoBooks.Domain.Entities.Masters;

public class InvoiceTemplate
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Layout { get; set; } = "classic"; // classic, modern, minimal

    [MaxLength(20)]
    public string PrimaryColor { get; set; } = "#2563eb";

    [MaxLength(20)]
    public string AccentColor { get; set; } = "#1e40af";

    [MaxLength(500)]
    public string HeaderText { get; set; } = string.Empty;

    [MaxLength(500)]
    public string FooterText { get; set; } = string.Empty;

    public bool ShowBankDetails { get; set; }

    // Storing as Base64 for simplicity in this iteration
    public string Logo { get; set; } = string.Empty;

    public bool IsDefault { get; set; }

    public bool IsActive { get; set; } = true;
}
