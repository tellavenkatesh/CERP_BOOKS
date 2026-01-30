using System;
using System.Collections.Generic;

namespace CompreoBooks.Application.Features.AI.DTOs;

public class InvoiceExtractionResult
{
    public string VendorName { get; set; } = string.Empty;
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime? InvoiceDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public List<ExtractedLineItem> LineItems { get; set; } = new();
    public decimal ConfidenceScore { get; set; }
    public string RawText { get; set; } = string.Empty;
    public string SuggestedAccount { get; set; } = string.Empty;
}

public class ExtractedLineItem
{
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Total { get; set; }
}

public class ChatResponse
{
    public string Reply { get; set; } = string.Empty;
    public List<string> Sources { get; set; } = new(); // Potential for RAG citations
}

public class CategorizationResult
{
    public string SuggestedAccount { get; set; } = string.Empty;
    public decimal Confidence { get; set; }
    public string Reasoning { get; set; } = string.Empty;
}

public class AnomalyResult
{
    public List<AnomalyItem> Anomalies { get; set; } = new();
}

public class AnomalyItem
{
    public string Type { get; set; } = string.Empty; // Duplicate, Outlier, etc.
    public string Description { get; set; } = string.Empty;
    public string Severity { get; set; } = "Low";
    public string TransactionId { get; set; } = string.Empty;
}
