using System;

using CompreoBooks.Domain.Entities.Masters;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompreoBooks.Domain.Entities.Financial;

public class Payment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string PaymentNumber { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
    
    public Guid VendorId { get; set; }
    public Party Vendor { get; set; } = null!;
    
    public decimal Amount { get; set; }
    public PaymentMode PaymentMode { get; set; }

    public Guid? AccountId { get; set; }
    [ForeignKey(nameof(AccountId))]
    public Account? Account { get; set; }

    public string? ReferenceNumber { get; set; }
    
    public Guid? BillId { get; set; }
    public string? BillNumber { get; set; }
    // Could add Navigation property if Bill is in different namespace, ensure valid using.
    // public Purchase.Bill? Bill { get; set; } 

    public string? Notes { get; set; }
}
