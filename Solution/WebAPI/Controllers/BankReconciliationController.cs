using CompreoBooks.Application.Features.Financial.Commands;
using CompreoBooks.Application.Features.Financial.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BankReconciliationController : ControllerBase
{
    private readonly IMediator _mediator;

    public BankReconciliationController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateBankReconciliationCommand command)
    {
        return await _mediator.Send(command);
    }

    [HttpGet("unreconciled")]
    public async Task<ActionResult<List<UnreconciledTransactionDto>>> GetUnreconciled([FromQuery] Guid accountId)
    {
        return await _mediator.Send(new GetUnreconciledTransactionsQuery(accountId));
    }
}
