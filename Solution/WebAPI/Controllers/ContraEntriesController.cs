using CompreoBooks.Application.Features.Financial.Commands;
using CompreoBooks.Application.Features.Financial.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContraEntriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ContraEntriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateContraEntryCommand command)
    {
        return await _mediator.Send(command);
    }

    [HttpGet]
    public async Task<ActionResult<List<ContraEntryDto>>> Get()
    {
        return await _mediator.Send(new GetContraEntriesQuery());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ContraEntryDetailDto>> GetById(Guid id)
    {
        return await _mediator.Send(new GetContraEntryByIdQuery(id));
    }
}
