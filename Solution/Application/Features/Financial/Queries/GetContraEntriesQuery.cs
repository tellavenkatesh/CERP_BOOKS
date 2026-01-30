using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Financial;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Financial.Queries;

public record GetContraEntriesQuery : IRequest<List<ContraEntryDto>>;

public class ContraEntryDto
{
    public Guid Id { get; set; }
    public string ContraNumber { get; set; } = string.Empty;
    public DateTime ContraDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class GetContraEntriesQueryHandler : IRequestHandler<GetContraEntriesQuery, List<ContraEntryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetContraEntriesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ContraEntryDto>> Handle(GetContraEntriesQuery request, CancellationToken cancellationToken)
    {
        return await _context.ContraEntries
            .OrderByDescending(x => x.ContraDate)
            .Select(x => new ContraEntryDto
            {
                Id = x.Id,
                ContraNumber = x.ContraNumber,
                ContraDate = x.ContraDate,
                Description = x.Description,
                TotalAmount = x.TotalAmount,
                Status = x.Status.ToString()
            })
            .ToListAsync(cancellationToken);
    }
}
