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

public record GetContraEntryByIdQuery(Guid Id) : IRequest<ContraEntryDetailDto>;

public class ContraEntryDetailDto
{
    public Guid Id { get; set; }
    public string ContraNumber { get; set; } = string.Empty;
    public DateTime ContraDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<ContraEntryLineDto> Lines { get; set; } = new();
}

public class ContraEntryLineDto
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Amount { get; set; }
    public string Type { get; set; } = string.Empty;
}

public class GetContraEntryByIdQueryHandler : IRequestHandler<GetContraEntryByIdQuery, ContraEntryDetailDto>
{
    private readonly IApplicationDbContext _context;

    public GetContraEntryByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ContraEntryDetailDto> Handle(GetContraEntryByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.ContraEntries
            .Include(x => x.Lines)
            .ThenInclude(x => x.Account)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (entity == null) return null!;

        return new ContraEntryDetailDto
        {
            Id = entity.Id,
            ContraNumber = entity.ContraNumber,
            ContraDate = entity.ContraDate,
            Description = entity.Description,
            TotalAmount = entity.TotalAmount,
            Status = entity.Status.ToString(),
            Lines = entity.Lines.Select(l => new ContraEntryLineDto
            {
                Id = l.Id,
                AccountId = l.AccountId,
                AccountName = l.Account.Name,
                Description = l.Description,
                Amount = l.Amount,
                Type = l.Type.ToString()
            }).ToList()
        };
    }
}
