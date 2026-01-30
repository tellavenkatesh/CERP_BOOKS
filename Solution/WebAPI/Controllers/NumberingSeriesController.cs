using CompreoBooks.Application.Features.Settings.Commands.CreateNumberingSeries;
using CompreoBooks.Application.Features.Settings.Queries.GetNumberingSeries;
using Microsoft.AspNetCore.Mvc;

using MediatR;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NumberingSeriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public NumberingSeriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<NumberingSeriesDto>>> GetNumberingSeries()
    {
        return await _mediator.Send(new GetNumberingSeriesQuery());
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateNumberingSeriesCommand command)
    {
        return await _mediator.Send(command);
    }
}
