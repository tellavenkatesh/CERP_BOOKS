using CompreoBooks.Application.Features.Parties.Commands;
using CompreoBooks.Application.Features.Parties.DTOs;
using CompreoBooks.Application.Features.Parties.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PartiesController : ControllerBase
{
    private readonly IMediator _mediator;

    public PartiesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllPartiesQuery());
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreatePartyDto dto)
    {
        var id = await _mediator.Send(new CreatePartyCommand(dto));
        return CreatedAtAction(nameof(GetAll), new { id }, id);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var result = await _mediator.Send(new GetPartyByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, CreatePartyDto dto)
    {
        if (id == Guid.Empty) return BadRequest();
        await _mediator.Send(new UpdatePartyCommand(id, dto));
        return NoContent();
    }
}
