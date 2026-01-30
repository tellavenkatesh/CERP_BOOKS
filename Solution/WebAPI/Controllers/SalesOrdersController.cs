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
public class SalesOrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public SalesOrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateSalesOrderDto dto, CancellationToken cancellationToken)
    {
        var command = new CreateSalesOrderCommand(dto);
        var id = await _mediator.Send(command, cancellationToken);
        return Ok(id);
    }

    [HttpGet]
    public async Task<ActionResult<List<SalesOrderDto>>> GetAll(CancellationToken cancellationToken)
    {
        var query = new GetAllSalesOrdersQuery();
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SalesOrderDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetSalesOrderByIdQuery(id);
        var result = await _mediator.Send(query, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, CreateSalesOrderDto dto, CancellationToken cancellationToken)
    {
        var command = new UpdateSalesOrderCommand(id, dto);
        await _mediator.Send(command, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id}/send")]
    public async Task<ActionResult> SendOrder(Guid id, [FromBody] SendOrderRequest request, CancellationToken cancellationToken)
    {
        var command = new SendSalesOrderCommand(id, request.To, request.Subject, request.Body);
        await _mediator.Send(command, cancellationToken);
        return Ok();
    }

    public record SendOrderRequest(string? To, string? Subject, string? Body);

    [HttpGet("public/{token}")]
    public async Task<ActionResult<SalesOrderDto>> GetPublic(Guid token, CancellationToken cancellationToken)
    {
        var query = new GetSalesOrderPublicQuery(token);
        var result = await _mediator.Send(query, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("public/{token}/respond")]
    public async Task<ActionResult> Respond(Guid token, RespondToSalesOrderCommand command, CancellationToken cancellationToken)
    {
        if (token != command.Token) return BadRequest();
        await _mediator.Send(command, cancellationToken);
        return Ok();
    }

    [HttpPost("{id}/approve")]
    public async Task<ActionResult> Approve(Guid id, CancellationToken cancellationToken)
    {
        var command = new ApproveSalesOrderCommand(id);
        await _mediator.Send(command, cancellationToken);
        return Ok();
    }
}
