using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Features.Purchase.Commands;
using CompreoBooks.Application.Features.Purchase.DTOs;
using CompreoBooks.Application.Features.Purchase.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PurchaseRequestsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PurchaseRequestsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreatePurchaseRequestDto dto, CancellationToken cancellationToken)
    {
        var command = new CreatePurchaseRequestCommand(dto);
        var id = await _mediator.Send(command, cancellationToken);
        return Ok(id);
    }

    [HttpGet]
    public async Task<ActionResult<List<PurchaseRequestDto>>> GetAll(CancellationToken cancellationToken)
    {
        try
        {
            var query = new GetPurchaseRequestsQuery();
            var result = await _mediator.Send(query, cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = ex.Message, StackTrace = ex.StackTrace, InnerException = ex.InnerException?.Message });
        }
    }

    public record ApproveRequestBody(string Remarks);

    [HttpPost("{id}/approve")]
    public async Task<ActionResult<bool>> Approve(Guid id, [FromBody] ApproveRequestBody body, CancellationToken cancellationToken)
    {
        var command = new ApprovePurchaseRequestCommand(id, body?.Remarks ?? string.Empty);
        var result = await _mediator.Send(command, cancellationToken);
        if (!result) return BadRequest("Failed to approve PR.");
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<string>> Update(Guid id, CreatePurchaseRequestDto dto, CancellationToken cancellationToken)
    {
        var command = new UpdatePurchaseRequestCommand(id, dto);
        try 
        {
            var result = await _mediator.Send(command, cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
