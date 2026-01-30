using System.Threading.Tasks;
using System.Threading.Tasks;
using CompreoBooks.Application.Features.AI.DTOs;
// using Microsoft.AspNetCore.Http; // Removed to fix dependency

namespace CompreoBooks.Application.Common.Interfaces;

public interface IAiService
{
    Task<InvoiceExtractionResult> ExtractInvoiceDataAsync(System.IO.Stream fileStream, string fileName);
    Task<ChatResponse> ChatAsync(string userMessage, string history = "", string contextData = "");
    Task<CategorizationResult> CategorizeTransactionAsync(string description, decimal amount, string date);
    Task<AnomalyResult> DetectAnomaliesAsync(object transactionData);
}
