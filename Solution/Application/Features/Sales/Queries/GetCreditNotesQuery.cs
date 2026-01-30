using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Sales;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Queries;

public record GetCreditNotesQuery : IRequest<List<CreditNoteDto>>;

public class CreditNoteDto
{
    public Guid Id { get; set; }
    public string CreditNoteNumber { get; set; } = string.Empty;
    public DateTime CreditNoteDate { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class GetCreditNotesQueryHandler : IRequestHandler<GetCreditNotesQuery, List<CreditNoteDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetCreditNotesQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<CreditNoteDto>> Handle(GetCreditNotesQuery request, CancellationToken cancellationToken)
    {
        return await _context.CreditNotes
            .Include(x => x.Customer)
            .OrderByDescending(x => x.CreditNoteDate)
            .Select(x => new CreditNoteDto
            {
                Id = x.Id,
                CreditNoteNumber = x.CreditNoteNumber,
                CreditNoteDate = x.CreditNoteDate,
                CustomerName = x.Customer.Name,
                TotalAmount = x.TotalAmount,
                Status = x.Status.ToString()
            })
            .ToListAsync(cancellationToken);
    }
}
