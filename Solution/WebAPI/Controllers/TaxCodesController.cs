using CompreoBooks.Application.Features.Masters.Commands.CreateTaxCode;
using CompreoBooks.Application.Features.Masters.Queries.GetTaxCodes;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaxCodesController : ControllerBase
{
    private readonly IMediator _mediator;

    public TaxCodesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateTaxCodeCommand command)
    {
        return await _mediator.Send(command);
    }

    [HttpGet]
    public async Task<ActionResult<List<TaxCodeDto>>> Get()
    {
        return await _mediator.Send(new GetTaxCodesQuery());
    }
}
