using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.Purchase.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Purchase.Queries;

public record GetPurchaseRequestsQuery : IRequest<List<PurchaseRequestDto>>;

public class GetPurchaseRequestsQueryHandler : IRequestHandler<GetPurchaseRequestsQuery, List<PurchaseRequestDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetPurchaseRequestsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<PurchaseRequestDto>> Handle(GetPurchaseRequestsQuery request, CancellationToken cancellationToken)
    {
        try 
        {
            // Using Manual Mapping for simplicity/control, or AutoMapper if configured
            var prs = await _context.PurchaseRequests
                .Include(x => x.Items)
                .ThenInclude(i => i.Item)
                .OrderByDescending(x => x.RequestDate)
                .ToListAsync(cancellationToken);

            return prs.Select(pr => new PurchaseRequestDto
            {
                Id = pr.Id,
                RequestNumber = pr.RequestNumber,
                RequestDate = pr.RequestDate,
                RequiredDate = pr.RequiredDate,
                RequestedBy = pr.RequestedBy,
                Reason = pr.Reason,
                Department = pr.Department,
                Priority = (int)pr.Priority,
                ApprovedBy = pr.ApprovedBy,
                Remarks = pr.Remarks,
                Status = pr.Status.ToString(),
                Items = pr.Items.Select(i => new PurchaseRequestItemDto
                {
                    Id = i.Id,
                    ItemId = i.ItemId,
                    ItemName = i.Item?.Name ?? "Unknown Item", // Handle potential null Item
                    Description = i.Description,
                    Quantity = i.Quantity,
                    EstimatedRate = i.EstimatedRate,
                    EstimatedAmount = i.EstimatedAmount
                }).ToList()
            }).ToList();
        }
        catch (System.Exception ex)
        {
            System.Console.WriteLine($"ERROR in GetPurchaseRequestsQueryHandler: {ex.Message}");
            System.Console.WriteLine(ex.StackTrace);
            throw;
        }
    }
}
