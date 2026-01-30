using System;
using CompreoBooks.Domain.Entities.Financial;
using CompreoBooks.Domain.Entities.Masters;


namespace CompreoBooks.Application.Features.Financial.Receipts.DTOs;

public class ReceiptDto
{
    public Guid Id { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty;
    public DateTime ReceiptDate { get; set; }
    
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    
    public decimal Amount { get; set; }
    public PaymentMode PaymentMode { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
}
