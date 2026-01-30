using System;
using System.ComponentModel.DataAnnotations.Schema;
using CompreoBooks.Domain.Entities.Masters;

namespace CompreoBooks.Domain.Entities.Financial;

public enum ContraType
{
    Debit,
    Credit
}

public class ContraEntryLine
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid ContraEntryId { get; set; }
    [ForeignKey(nameof(ContraEntryId))]
    public ContraEntry ContraEntry { get; set; } = null!;

    public Guid AccountId { get; set; }
    [ForeignKey(nameof(AccountId))]
    public Account Account { get; set; } = null!;

    public string? Description { get; set; }
    public decimal Amount { get; set; }
    
    public ContraType Type { get; set; }
}
