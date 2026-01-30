using CompreoBooks.Application.Features.Masters.Commands.CreateTdsCategory;
using CompreoBooks.Application.Features.Masters.Queries.GetTdsCategories;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CompreoBooks.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TdsCategoriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public TdsCategoriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateTdsCategoryCommand command)
    {
        return await _mediator.Send(command);
    }

    [HttpGet]
    public async Task<ActionResult<List<TdsCategoryDto>>> Get()
    {
        return await _mediator.Send(new GetTdsCategoriesQuery());
    }
}
