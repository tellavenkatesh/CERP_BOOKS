using System;
using System.Collections.Generic;


namespace CompreoBooks.Domain.Entities.Financial;

public class JournalEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string JournalNumber { get; set; } = string.Empty;
    public DateTime JournalDate { get; set; }
    public string Narration { get; set; } = string.Empty;
    
    public JournalEntryStatus Status { get; set; } = JournalEntryStatus.Draft;
    
    public IList<JournalEntryLine> Lines { get; set; } = new List<JournalEntryLine>();
}

public enum JournalEntryStatus
{
    Draft,
    Posted,
    Cancelled
}
