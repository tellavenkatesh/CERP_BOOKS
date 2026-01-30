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
public class BillsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BillsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateBillDto dto, CancellationToken cancellationToken)
    {
        var command = new CreateBillCommand(dto);
        var id = await _mediator.Send(command, cancellationToken);
        return Ok(id);
    }

    [HttpGet]
    public async Task<ActionResult<List<BillDto>>> GetAll(CancellationToken cancellationToken)
    {
        var query = new GetAllBillsQuery();
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }
}
