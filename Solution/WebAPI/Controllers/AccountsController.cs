using CompreoBooks.Application.Features.Accounts.Commands;
using CompreoBooks.Application.Features.Accounts.DTOs;
using CompreoBooks.Application.Features.Accounts.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AccountsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllAccountsQuery());
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateAccountDto dto)
    {
        var id = await _mediator.Send(new CreateAccountCommand(dto));
        return CreatedAtAction(nameof(GetAll), new { id }, id);
    }
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, CreateAccountDto dto)
    {
        if (id == Guid.Empty) return BadRequest();
        await _mediator.Send(new UpdateAccountCommand(id, dto));
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new DeleteAccountCommand(id));
        return NoContent();
    }
}
