using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CompreoBooks.Application.Features.Sales.Commands;
using CompreoBooks.Application.Features.Sales.DTOs;
using CompreoBooks.Application.Features.Sales.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecurringInvoicesController : ControllerBase
{
    private readonly ISender _sender;

    public RecurringInvoicesController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<ActionResult<List<RecurringInvoiceDto>>> Get()
    {
        return await _sender.Send(new GetRecurringInvoicesQuery());
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateRecurringInvoiceCommand command)
    {
        return await _sender.Send(command);
    }
}
