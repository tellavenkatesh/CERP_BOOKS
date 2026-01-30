using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompreoBooks.Domain.Entities.Financial;

public class BankReconciliationItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid BankReconciliationId { get; set; }
    [ForeignKey(nameof(BankReconciliationId))]
    public BankReconciliation BankReconciliation { get; set; } = null!;

    public DateTime TransactionDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; } // Debit or Credit based on transaction

    public Guid? PaymentId { get; set; }
    [ForeignKey(nameof(PaymentId))]
    public Payment? Payment { get; set; }

    public Guid? ReceiptId { get; set; }
    [ForeignKey(nameof(ReceiptId))]
    public Receipt? Receipt { get; set; }

    public Guid? ContraEntryLineId { get; set; }
    [ForeignKey(nameof(ContraEntryLineId))]
    public ContraEntryLine? ContraEntryLine { get; set; }
}
