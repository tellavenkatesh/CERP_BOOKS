using CompreoBooks.Application.Features.Items.Commands;
using CompreoBooks.Application.Features.Items.DTOs;
using CompreoBooks.Application.Features.Items.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ItemsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllItemsQuery());
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateItemDto dto)
    {
        var id = await _mediator.Send(new CreateItemCommand(dto));
        return CreatedAtAction(nameof(GetAll), new { id }, id);
    }
}
