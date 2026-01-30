using CompreoBooks.Application.Features.Identity.Commands.Login;
using CompreoBooks.Application.Features.Identity.Commands.Register;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CompreoBooks.WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginCommand command)
    {
        try
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (System.UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (System.Exception ex)
        {
            // Log the exception (if logger were available in this context, otherwise console)
            System.Console.WriteLine($"[Auth Error]: {ex.Message}");
            return StatusCode(500, new { message = "Internal Server Error: " + ex.Message });
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult<RegisterResponse>> Register(RegisterCommand command)
    {
        try
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
