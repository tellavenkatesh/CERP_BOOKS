using System.Threading.Tasks;
using CompreoBooks.Application.Features.AI.Commands;
using CompreoBooks.Application.Features.AI.DTOs;
using CompreoBooks.Application.Features.AI.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AiController : ControllerBase
{
    private readonly IMediator _mediator;

    public AiController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("extract-invoice")]
    public async Task<ActionResult<InvoiceExtractionResult>> ExtractInvoice(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        using var stream = file.OpenReadStream();
        return await _mediator.Send(new ExtractInvoiceDataCommand(stream, file.FileName));
    }

    [HttpPost("chat")]
    public async Task<ActionResult<ChatResponse>> Chat([FromBody] ChatRequestDto request)
    {
        return await _mediator.Send(new ChatWithAiCommand(request.Message));
    }

    [HttpGet("categorize")]
    public async Task<ActionResult<CategorizationResult>> Categorize(string description, decimal amount, string date)
    {
        return await _mediator.Send(new GetSmartCategorizationQuery(description, amount, date));
    }

    // TODO: Need endpoint for Anomaly Detection (might be triggered by a button or background job)
    // For manual trigger:
    [HttpPost("detect-anomalies")]
    public async Task<ActionResult<AnomalyResult>> DetectAnomalies([FromBody] object transactionData)
    {
        return await _mediator.Send(new GetAnomaliesQuery(transactionData));
    }
}

public class ChatRequestDto
{
    public string Message { get; set; } = string.Empty;
}
