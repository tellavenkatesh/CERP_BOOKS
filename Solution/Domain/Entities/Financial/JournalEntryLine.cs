using System;

using CompreoBooks.Domain.Entities.Masters;

namespace CompreoBooks.Domain.Entities.Financial;

public class JournalEntryLine
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid JournalEntryId { get; set; }
    public JournalEntry JournalEntry { get; set; } = null!;
    
    public Guid AccountId { get; set; }
    public Account Account { get; set; } = null!;

    public Guid? PartyId { get; set; }
    public Party? Party { get; set; }
    
    public string? Description { get; set; }
    
    public decimal DebitAmount { get; set; }
    public decimal CreditAmount { get; set; }
}
