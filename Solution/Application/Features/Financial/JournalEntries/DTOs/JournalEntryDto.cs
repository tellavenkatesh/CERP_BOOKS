using System;
using System.Collections.Generic;
using CompreoBooks.Domain.Entities.Financial;


namespace CompreoBooks.Application.Features.Financial.JournalEntries.DTOs;

public class JournalEntryDto
{
    public Guid Id { get; set; }
    public string JournalNumber { get; set; } = string.Empty;
    public DateTime JournalDate { get; set; }
    public string Narration { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public List<JournalEntryLineDto> Lines { get; set; } = new();
}

public class JournalEntryLineDto
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public Guid? PartyId { get; set; }
    public string? PartyName { get; set; }
    public string? Description { get; set; }
    public decimal DebitAmount { get; set; }
    public decimal CreditAmount { get; set; }
}
