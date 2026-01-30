using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace CompreoBooks.Domain.Entities.Financial;

public enum ContraEntryStatus
{
    Draft,
    Posted,
    Cancelled
}

public class ContraEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ContraNumber { get; set; } = string.Empty;
    public DateTime ContraDate { get; set; }
    public string Description { get; set; } = string.Empty;

    public decimal TotalAmount { get; set; }

    public ContraEntryStatus Status { get; set; } = ContraEntryStatus.Draft;

    public List<ContraEntryLine> Lines { get; set; } = new();
}
