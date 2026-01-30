using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CompreoBooks.Application.Features.Financial.Payments.Commands;
using CompreoBooks.Application.Features.Financial.Payments.DTOs;
using CompreoBooks.Application.Features.Financial.Payments.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PaymentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<PaymentDto>>> GetPayments()
    {
        return await _mediator.Send(new GetPaymentsQuery());
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreatePaymentDto dto)
    {
        var command = new CreatePaymentCommand(dto);
        return await _mediator.Send(command);
    }
}
