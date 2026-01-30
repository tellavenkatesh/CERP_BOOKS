using CompreoBooks.Application.Features.Companies.Commands;
using CompreoBooks.Application.Features.Companies.DTOs;
using CompreoBooks.Application.Features.Companies.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompaniesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CompaniesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var companies = await _mediator.Send(new GetAllCompaniesQuery());
        return Ok(companies);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateCompanyDto dto)
    {
        var id = await _mediator.Send(new CreateCompanyCommand(dto));
        return CreatedAtAction(nameof(GetAll), new { id }, id);
    }

    [HttpGet("settings")]
    public async Task<ActionResult<CompanyDto>> GetSettings()
    {
        var company = await _mediator.Send(new GetCompanySettingsQuery());
        if (company == null) return NoContent();
        return Ok(company);
    }

    [HttpPut("settings")]
    public async Task<ActionResult> UpdateCompanySettings([FromBody] UpdateCompanyDto dto)
    {
        var result = await _mediator.Send(new UpdateCompanyCommand(dto));
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPut("period-lock")]
    public async Task<ActionResult> UpdatePeriodLock([FromBody] UpdatePeriodLockCommand command)
    {
        await _mediator.Send(command);
        return NoContent();
    }
}
