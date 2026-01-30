using System;
using CompreoBooks.Domain.Entities.Financial;
using CompreoBooks.Domain.Entities.Masters;


namespace CompreoBooks.Application.Features.Financial.Payments.DTOs;

public class PaymentDto
{
    public Guid Id { get; set; }
    public string PaymentNumber { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
    
    public Guid VendorId { get; set; }
    public string VendorName { get; set; } = string.Empty;
    
    public decimal Amount { get; set; }
    public PaymentMode PaymentMode { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
}

public class CreatePaymentDto
{
    public DateTime PaymentDate { get; set; }
    public Guid VendorId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMode PaymentMode { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
    
    public Guid? BillId { get; set; }
}
