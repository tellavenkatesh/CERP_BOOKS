using System;

using CompreoBooks.Domain.Entities.Masters;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompreoBooks.Domain.Entities.Financial;

public enum PaymentMode
{
    Cash = 0,
    BankTransfer = 1,
    Cheque = 2,
    UPI = 3,
    CreditCard = 4
}

public class Receipt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ReceiptNumber { get; set; } = string.Empty;
    public DateTime ReceiptDate { get; set; }
    
    public Guid CustomerId { get; set; }
    public Party Customer { get; set; } = null!;
    
    public decimal Amount { get; set; }
    public PaymentMode PaymentMode { get; set; }
    
    public Guid? AccountId { get; set; }
    [ForeignKey(nameof(AccountId))]
    public Account? Account { get; set; }

    public string? ReferenceNumber { get; set; } // Cheque no / Transaction ID
    
    public string? Notes { get; set; }
}
