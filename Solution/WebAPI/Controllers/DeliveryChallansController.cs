using CompreoBooks.Application.Features.Sales.Commands;
using CompreoBooks.Application.Features.Sales.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DeliveryChallansController : ControllerBase
{
    private readonly IMediator _mediator;

    public DeliveryChallansController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateDeliveryChallanCommand command)
    {
        return await _mediator.Send(command);
    }

    [HttpGet]
    public async Task<ActionResult<List<DeliveryChallanDto>>> Get()
    {
        return await _mediator.Send(new GetDeliveryChallansQuery());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DeliveryChallanDetailDto>> GetById(Guid id)
    {
        return await _mediator.Send(new GetDeliveryChallanByIdQuery(id));
    }

    [HttpPost("{id}/approve")]
    public async Task<ActionResult> Approve(Guid id)
    {
        var command = new ApproveDeliveryChallanCommand(id);
        await _mediator.Send(command);
        return Ok();
    }
    [HttpGet("pending")]
    public async Task<ActionResult<List<PendingDeliveryChallanDto>>> GetPending([FromQuery] Guid customerId)
    {
        return await _mediator.Send(new GetPendingDeliveryChallansQuery(customerId));
    }
}
