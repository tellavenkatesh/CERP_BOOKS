using CompreoBooks.Application.Features.Identity.Queries;
using CompreoBooks.Application.Features.Identity.Commands.UpdateUser;
using CompreoBooks.Application.Features.Identity.Commands.CreateUser;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CompreoBooks.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetUsers()
    {
        return await _mediator.Send(new GetUsersQuery());
    }

    [HttpPut("{id}/role")]
    public async Task<ActionResult> UpdateRole(System.Guid id, [FromBody] UpdateUserRoleCommand command)
    {
        if (id != command.UserId)
            return BadRequest();

        var result = await _mediator.Send(command);
        if (!result) return NotFound();

        return NoContent();
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult> ToggleStatus(System.Guid id, [FromBody] ToggleUserStatusCommand command)
    {
        if (id != command.UserId)
            return BadRequest();

        var result = await _mediator.Send(command);
        if (!result) return NotFound();

        return NoContent();
    }
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateUserCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.Success) return BadRequest(result.Message);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(System.Guid id, [FromBody] UpdateUserCommand command)
    {
        if (id != command.UserId)
            return BadRequest();

        var result = await _mediator.Send(command);
        if (!result) return NotFound();

        return NoContent();
    }
}
