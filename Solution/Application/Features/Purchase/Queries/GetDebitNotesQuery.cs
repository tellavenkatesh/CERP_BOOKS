using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Purchase;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Purchase.Queries;

public record GetDebitNotesQuery : IRequest<List<DebitNoteDto>>;

public class DebitNoteDto
{
    public Guid Id { get; set; }
    public string DebitNoteNumber { get; set; } = string.Empty;
    public DateTime DebitNoteDate { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class GetDebitNotesQueryHandler : IRequestHandler<GetDebitNotesQuery, List<DebitNoteDto>>
{
    private readonly IApplicationDbContext _context;

    public GetDebitNotesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<DebitNoteDto>> Handle(GetDebitNotesQuery request, CancellationToken cancellationToken)
    {
        return await _context.DebitNotes
            .Include(x => x.Vendor)
            .OrderByDescending(x => x.DebitNoteDate)
            .Select(x => new DebitNoteDto
            {
                Id = x.Id,
                DebitNoteNumber = x.DebitNoteNumber,
                DebitNoteDate = x.DebitNoteDate,
                VendorName = x.Vendor.Name,
                TotalAmount = x.TotalAmount,
                Status = x.Status.ToString()
            })
            .ToListAsync(cancellationToken);
    }
}
