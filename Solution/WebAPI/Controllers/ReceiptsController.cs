using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CompreoBooks.Application.Features.Financial.Receipts.Commands;
using CompreoBooks.Application.Features.Financial.Receipts.DTOs;
using CompreoBooks.Application.Features.Financial.Receipts.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReceiptsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReceiptsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<ReceiptDto>>> GetReceipts()
    {
        return await _mediator.Send(new GetReceiptsQuery());
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateReceiptCommand command)
    {
        return await _mediator.Send(command);
    }
}
