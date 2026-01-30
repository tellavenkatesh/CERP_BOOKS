using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Features.Sales.Commands;
using CompreoBooks.Application.Features.Sales.DTOs;
using CompreoBooks.Application.Features.Sales.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly IMediator _mediator;

    public InvoicesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateInvoiceDto dto, CancellationToken cancellationToken)
    {
        var command = new CreateInvoiceCommand(dto);
        var id = await _mediator.Send(command, cancellationToken);
        return Ok(id);
    }

    [HttpGet]
    public async Task<ActionResult<List<InvoiceDto>>> GetAll(CancellationToken cancellationToken)
    {
        var query = new GetAllInvoicesQuery();
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id}/approve")]
    public async Task<ActionResult<bool>> Approve(Guid id, CancellationToken cancellationToken)
    {
        var command = new ApproveInvoiceCommand(id);
        var result = await _mediator.Send(command, cancellationToken);
        if (!result) return BadRequest("Failed to approve invoice or it is not in Draft state.");
        return Ok(result);
    }
}
