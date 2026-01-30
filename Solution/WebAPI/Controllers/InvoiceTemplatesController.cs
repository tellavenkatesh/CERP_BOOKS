using CompreoBooks.Application.Features.Settings.Commands.CreateInvoiceTemplate;
using CompreoBooks.Application.Features.Settings.Queries.GetInvoiceTemplates;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoiceTemplatesController : ControllerBase
{
    private readonly IMediator _mediator;

    public InvoiceTemplatesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<InvoiceTemplateDto>>> Get()
    {
        return await _mediator.Send(new GetInvoiceTemplatesQuery());
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateInvoiceTemplateCommand command)
    {
        return await _mediator.Send(command);
    }
}
