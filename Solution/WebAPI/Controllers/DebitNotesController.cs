using CompreoBooks.Application.Features.Purchase.Commands;
using CompreoBooks.Application.Features.Purchase.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DebitNotesController : ControllerBase
{
    private readonly IMediator _mediator;

    public DebitNotesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateDebitNoteCommand command)
    {
        return await _mediator.Send(command);
    }

    [HttpGet]
    public async Task<ActionResult<List<DebitNoteDto>>> Get()
    {
        return await _mediator.Send(new GetDebitNotesQuery());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DebitNoteDetailDto>> GetById(Guid id)
    {
        return await _mediator.Send(new GetDebitNoteByIdQuery(id));
    }
}
