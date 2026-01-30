using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using CompreoBooks.Domain.Entities.Masters;

namespace CompreoBooks.Domain.Entities.Financial;

public class BankReconciliation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid AccountId { get; set; }
    [ForeignKey(nameof(AccountId))]
    public Account Account { get; set; } = null!;

    public DateTime StatementDate { get; set; }
    public decimal StatementBalance { get; set; }
    
    public DateTime ReconciledDate { get; set; } = DateTime.UtcNow;
    
    public List<BankReconciliationItem> Items { get; set; } = new();
}
