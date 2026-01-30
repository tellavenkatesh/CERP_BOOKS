using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.AI.DTOs;
using CompreoBooks.Domain.Entities.AI;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CompreoBooks.Infrastructure.Services;

public class GroqAiService : IAiService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GroqAiService> _logger;
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly string _apiKey;
    private readonly string _model = "llama-3.3-70b-versatile";
    private readonly string _visionModel = "llama-3.2-11b-vision-preview";

    public GroqAiService(
        HttpClient httpClient, 
        IConfiguration configuration, 
        ILogger<GroqAiService> logger,
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
        _context = context;
        _currentUserService = currentUserService;
        _apiKey = _configuration["AI:GroqApiKey"] ?? throw new InvalidOperationException("Groq API Key is missing in configuration.");
        
        _httpClient.BaseAddress = new Uri("https://api.groq.com/openai/v1/");
        _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);
    }

    public async Task<InvoiceExtractionResult> ExtractInvoiceDataAsync(System.IO.Stream fileStream, string fileName)
    {
        string prompt = "Extract the following fields from this invoice: VendorName, InvoiceNumber, InvoiceDate (Format: YYYY-MM-DD), TotalAmount, TaxAmount, LineItems (Description, Quantity, UnitPrice, Total). Also suggest a 'SuggestedAccount' (Expense Category) for this invoice. Return ONLY a JSON object. Ensure InvoiceDate is strictly YYYY-MM-DD.";
        object requestBody;
        string modelToUse;

        // Check if PDF
        if (fileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
        {
            modelToUse = _model; // Use Text Model
            string pdfText = "";
            try
            {
                using (var document = UglyToad.PdfPig.PdfDocument.Open(fileStream))
                {
                    foreach (var page in document.GetPages())
                    {
                        pdfText += page.Text + "\n";
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to extract text from PDF");
                return new InvoiceExtractionResult { RawText = "Failed to read PDF file." };
            }

            if (string.IsNullOrWhiteSpace(pdfText))
            {
                 return new InvoiceExtractionResult { RawText = "PDF contains no extractable text (scanned?)." };
            }

            requestBody = new
            {
                model = modelToUse,
                messages = new[]
                {
                    new { role = "system", content = "You are an expert invoice data extractor." },
                    new { role = "user", content = $"{prompt}\n\nINVOICE CONTENT:\n{pdfText}" }
                },
                response_format = new { type = "json_object" }
            };
        }
        else
        {
            // Assume Image
            modelToUse = _visionModel;
            string base64Image = "";
            using (var ms = new System.IO.MemoryStream())
            {
                await fileStream.CopyToAsync(ms);
                var fileBytes = ms.ToArray();
                base64Image = Convert.ToBase64String(fileBytes);
            }

            requestBody = new
            {
                model = modelToUse,
                messages = new[]
                {
                    new {
                        role = "user",
                        content = new object[]
                        {
                            new { type = "text", text = prompt },
                            new { type = "image_url", image_url = new { url = $"data:image/jpeg;base64,{base64Image}" } }
                        }
                    }
                },
                temperature = 0,
                response_format = new { type = "json_object" }
            };
        }

        InvoiceExtractionLog log = new()
        {
            FileName = fileName,
            ExtractionDate = DateTime.UtcNow
        };

        try 
        {
            var response = await _httpClient.PostAsJsonAsync("chat/completions", requestBody);
            response.EnsureSuccessStatusCode();
            
            var result = await response.Content.ReadFromJsonAsync<GroqResponse>();
            var content = result?.choices?[0]?.message?.content;

            log.RawJsonResponse = content ?? "No Content";

            if (!string.IsNullOrEmpty(content))
            {
                var extraction = JsonSerializer.Deserialize<InvoiceExtractionResult>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (extraction != null)
                {
                    extraction.RawText = content;
                    extraction.ConfidenceScore = 0.95m;

                    // Log Success
                    log.VendorName = extraction.VendorName;
                    log.TotalAmount = extraction.TotalAmount;
                    log.IsSuccess = true;
                    
                    _context.InvoiceExtractionLogs.Add(log);
                    await _context.SaveChangesAsync(default);

                    return extraction;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Groq OCR Failed");
            log.IsSuccess = false;
            log.RawJsonResponse = $"Error: {ex.Message}";
            _context.InvoiceExtractionLogs.Add(log);
            await _context.SaveChangesAsync(default);
        }

        return new InvoiceExtractionResult { RawText = "Extraction Failed" };
    }

    public async Task<ChatResponse> ChatAsync(string userMessage, string history = "", string contextData = "")
    {
        var messages = new List<object>
        {
            new { role = "system", content = @"You are a helpful financial assistant for Compreo Books ERP. 
Answer queries about finance, accounting, and the user's data.
You also act as a Navigator. If a user asks how to find a page or menu, use this Site Map to guide them:

DASHBOARD: /

SALES:
- Estimates/Quotes: /sales/estimates
- Sales Orders: /sales/orders
- Delivery Challans: /sales/delivery-challans
- Sales Invoices: /sales/invoices
- Credit Notes: /sales/credit-notes
- Recurring Invoices: /sales/recurring

PURCHASE:
- Purchase Requests: /purchase/requests
- Purchase Orders: /purchase/orders
- GRN (Goods Receipt): /purchase/grns
- Bills (Vendor Invoices): /purchase/bills
- Debit Notes: /purchase/debit-notes
- Vendor Payments: /purchase/payments

MASTERS:
- Chart of Accounts: /masters/accounts
- Customers: /masters/customers
- Vendors: /masters/vendors
- Items: /masters/items

FINANCIAL:
- Receipts: /financial/receipts
- Payments: /financial/payments
- Journal Entries: /financial/journal
- Bank Reconciliation: /financial/bank-reconciliation

REPORTS:
- Dashboard: /reports
- Ledger: /reports/ledger
- Trial Balance: /reports/trial-balance
- P&L: /reports/profit-loss
- Balance Sheet: /reports/balance-sheet
- Cash Flow: /reports/cash-flow
- GST Reports: /reports/gst
- TDS Reports: /reports/tds

ADMIN:
- Company Settings: /admin/company-settings
- Users: /admin/users
- Backup/Restore: /admin/backup-restore

AI FEATURES:
- Invoice Upload: /ai/invoice-upload
- Chat Assistant: /ai/chat" }
        };

        if (!string.IsNullOrEmpty(contextData))
        {
             userMessage = $"CONTEXT DATA:\n{contextData}\n\nUSER QUESTION:\n{userMessage}";
        }

        messages.Add(new { role = "user", content = userMessage });

        var requestBody = new
        {
            model = _model,
            messages = messages,
            temperature = 0.5
        };

        string aiReply = "Error generating response.";

        try
        {
            var response = await _httpClient.PostAsJsonAsync("chat/completions", requestBody);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<GroqResponse>();
            aiReply = result?.choices?[0]?.message?.content ?? "No response from AI.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Chat Failed");
            aiReply = "I'm sorry, I couldn't process your request right now.";
        }

        // Save Chat Log
        var chatLog = new AiChatLog
        {
            UserId = _currentUserService.UserId ?? "Anonymous",
            UserMessage = userMessage,
            AiResponse = aiReply,
            Timestamp = DateTime.UtcNow
        };
        _context.AiChatLogs.Add(chatLog);
        await _context.SaveChangesAsync(default);

        return new ChatResponse { Reply = aiReply };
    }

    public async Task<CategorizationResult> CategorizeTransactionAsync(string description, decimal amount, string date)
    {
        var prompt = $@"Categorize this transaction:
Description: {description}
Amount: {amount}
Date: {date}
Suggest a Chart of Accounts Name (e.g., Travelling Expenses, Office Supplies, Software Subscription). 
Return JSON: {{ ""SuggestedAccount"": ""..."", ""Confidence"": 0.XX, ""Reasoning"": ""..."" }}";

        var requestBody = new
        {
            model = _model,
            messages = new[] { new { role = "user", content = prompt } },
            response_format = new { type = "json_object" }
        };

        var response = await _httpClient.PostAsJsonAsync("chat/completions", requestBody);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<GroqResponse>();
        var content = result?.choices?[0]?.message?.content;

        if (!string.IsNullOrEmpty(content))
        {
            try 
            {
                return JsonSerializer.Deserialize<CategorizationResult>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
            }
            catch {}
        }
        return new CategorizationResult { SuggestedAccount = "Uncategorized", Confidence = 0, Reasoning = "Failed to parse AI response" };
    }

    public async Task<AnomalyResult> DetectAnomaliesAsync(object transactionData)
    {
        var jsonData = JsonSerializer.Serialize(transactionData);
        var prompt = $@"Analyze these transactions for anomalies (duplicates, outliers, odd dates, round numbers).
Data: {jsonData}
Return JSON: {{ ""Anomalies"": [ {{ ""Type"": ""..."", ""Description"": ""..."", ""Severity"": ""High/Medium/Low"", ""TransactionId"": ""..."" }} ] }}";

        var requestBody = new
        {
            model = _model,
            messages = new[] { new { role = "user", content = prompt } },
            response_format = new { type = "json_object" }
        };

        var response = await _httpClient.PostAsJsonAsync("chat/completions", requestBody);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<GroqResponse>();
        var content = result?.choices?[0]?.message?.content;

        if (!string.IsNullOrEmpty(content))
        {
            try
            {
                return JsonSerializer.Deserialize<AnomalyResult>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
            }
            catch {}
        }

        return new AnomalyResult();
    }

    private class GroqResponse
    {
        public Choice[]? choices { get; set; }
    }
    private class Choice
    {
        public Message? message { get; set; }
    }
    private class Message
    {
        public string? content { get; set; }
    }
}
