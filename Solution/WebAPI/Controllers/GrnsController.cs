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
public class GrnsController : ControllerBase
{
    private readonly IMediator _mediator;

    public GrnsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateGrnDto dto, CancellationToken cancellationToken)
    {
        var command = new CreateGrnCommand(dto);
        var id = await _mediator.Send(command, cancellationToken);
        return Ok(id);
    }

    [HttpGet]
    public async Task<ActionResult<List<GrnDto>>> GetAll(CancellationToken cancellationToken)
    {
        var query = new GetAllGrnsQuery();
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }
}
