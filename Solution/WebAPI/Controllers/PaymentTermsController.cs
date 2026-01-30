using CompreoBooks.Application.Features.Masters.Commands.CreatePaymentTerm;
using CompreoBooks.Application.Features.Masters.Queries.GetPaymentTerms;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentTermsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PaymentTermsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<PaymentTermDto>>> GetPaymentTerms()
    {
        return await _mediator.Send(new GetPaymentTermsQuery());
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(CreatePaymentTermCommand command)
    {
        return await _mediator.Send(command);
    }
}
