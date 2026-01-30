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
public class EstimatesController : ControllerBase
{
    private readonly IMediator _mediator;

    public EstimatesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateEstimateDto dto, CancellationToken cancellationToken)
    {
        var command = new CreateEstimateCommand(dto);
        var id = await _mediator.Send(command, cancellationToken);
        return Ok(id);
    }

    [HttpGet]
    public async Task<ActionResult<List<EstimateDto>>> GetAll(CancellationToken cancellationToken)
    {
        var query = new GetAllEstimatesQuery();
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EstimateDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetEstimateByIdQuery(id);
        var result = await _mediator.Send(query, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, CreateEstimateDto dto, CancellationToken cancellationToken)
    {
        var command = new UpdateEstimateCommand(id, dto);
        await _mediator.Send(command, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id}/approve")]
    public async Task<ActionResult> Approve(Guid id, CancellationToken cancellationToken)
    {
        var command = new ApproveEstimateCommand(id);
        await _mediator.Send(command, cancellationToken);
        return Ok();
    }

    [HttpPost("{id}/send")]
    public async Task<ActionResult> Send(Guid id, CancellationToken cancellationToken)
    {
        var command = new CompreoBooks.Application.Features.Sales.Commands.SendEstimate.SendEstimateCommand(id);
        await _mediator.Send(command, cancellationToken);
        return Ok();
    }

    [HttpGet("public/{token}")]
    [Microsoft.AspNetCore.Authorization.AllowAnonymous]
    public async Task<ActionResult<EstimateDto>> GetPublic(Guid token, CancellationToken cancellationToken)
    {
        var query = new GetEstimatePublicQuery(token);
        var result = await _mediator.Send(query, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("public/respond")]
    [Microsoft.AspNetCore.Authorization.AllowAnonymous]
    public async Task<ActionResult> Respond(CompreoBooks.Application.Features.Sales.Commands.RespondToEstimate.RespondToEstimateCommand command, CancellationToken cancellationToken)
    {
        await _mediator.Send(command, cancellationToken);
        return Ok();
    }
    [HttpPost("{id}/negotiate")]
    [Microsoft.AspNetCore.Authorization.AllowAnonymous]
    public async Task<ActionResult> SubmitNegotiation(Guid id, [FromBody] NegotiationRequest request, CancellationToken cancellationToken)
    {
        var command = new SubmitNegotiationCommand(id, request.PublicToken, request.ProposedEstimate);
        await _mediator.Send(command, cancellationToken);
        return Ok();
    }

    [HttpPost("{id}/convert-to-order")]
    [Microsoft.AspNetCore.Authorization.AllowAnonymous]
    public async Task<ActionResult<Guid>> ConvertToOrder(Guid id, [FromBody] ConversionRequest request, CancellationToken cancellationToken)
    {
        var command = new ConvertEstimateToSalesOrderCommand(id, request.PublicToken);
        var orderId = await _mediator.Send(command, cancellationToken);
        return Ok(orderId);
    }

    [HttpGet("{id}/versions")]
    public async Task<ActionResult<List<EstimateVersionDto>>> GetVersions(Guid id, CancellationToken cancellationToken)
    {
        return await _mediator.Send(new GetEstimateVersionsQuery(id), cancellationToken);
    }
}

public class NegotiationRequest
{
    public string PublicToken { get; set; } = string.Empty;
    public CreateEstimateDto ProposedEstimate { get; set; } = null!;
}

public class ConversionRequest
{
    public string PublicToken { get; set; } = string.Empty;
}
