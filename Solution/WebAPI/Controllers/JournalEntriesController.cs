using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CompreoBooks.Application.Features.Financial.JournalEntries.Commands;
using CompreoBooks.Application.Features.Financial.JournalEntries.DTOs;
using CompreoBooks.Application.Features.Financial.JournalEntries.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JournalEntriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public JournalEntriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<JournalEntryDto>>> GetEntries()
    {
        return await _mediator.Send(new GetJournalEntriesQuery());
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateJournalEntryCommand command)
    {
        return await _mediator.Send(command);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<JournalEntryDto>> GetById(Guid id)
    {
        return await _mediator.Send(new GetJournalEntryByIdQuery(id));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Unit>> Update(Guid id, UpdateJournalEntryCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest();
        }

        return await _mediator.Send(command);
    }
}
