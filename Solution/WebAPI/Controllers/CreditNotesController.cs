using CompreoBooks.Application.Features.Sales.Commands;
using CompreoBooks.Application.Features.Sales.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CreditNotesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CreditNotesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateCreditNoteCommand command)
    {
        return await _mediator.Send(command);
    }

    [HttpGet]
    public async Task<ActionResult<List<CreditNoteDto>>> Get()
    {
        return await _mediator.Send(new GetCreditNotesQuery());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CreditNoteDetailDto>> GetById(Guid id)
    {
        return await _mediator.Send(new GetCreditNoteByIdQuery(id));
    }
}
