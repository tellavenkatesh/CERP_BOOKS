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
public class PurchaseOrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public PurchaseOrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreatePurchaseOrderCommand command, CancellationToken cancellationToken)
    {
        // var command = new CreatePurchaseOrderCommand(dto); // Removed wrapper
        var id = await _mediator.Send(command, cancellationToken);
        return Ok(id);
    }

    [HttpGet]
    public async Task<ActionResult<List<PurchaseOrderDto>>> GetAll(CancellationToken cancellationToken)
    {
        var query = new GetAllPurchaseOrdersQuery();
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }
    [HttpPost("{id}/approve")]
    public async Task<ActionResult<bool>> Approve(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new ApprovePurchaseOrderCommand(id), cancellationToken);
        if (!result) return NotFound();
        return Ok(result);
    }

    [HttpPost("{id}/send")]
    public async Task<ActionResult<bool>> Send(Guid id, CancellationToken cancellationToken)
    {
        try 
        {
            var result = await _mediator.Send(new SendPurchaseOrderCommand(id), cancellationToken);
            if (!result) return NotFound();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpPut("{id}")]
    public async Task<ActionResult<string>> Update(Guid id, CreatePurchaseOrderDto dto, CancellationToken cancellationToken)
    {
        var command = new UpdatePurchaseOrderCommand(id, dto);
        try 
        {
            var result = await _mediator.Send(command, cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            await System.IO.File.WriteAllTextAsync(@"C:\TellaWA\Compreo_Books_ERP\po_update_error.txt", $"Error: {ex.Message}\nStack: {ex.StackTrace}");
            return BadRequest(ex.Message);
        }
    }
}
