using AutoMapper;
using AutoMapper.QueryableExtensions;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Sales;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Queries;

public record GetDeliveryChallansQuery : IRequest<List<DeliveryChallanDto>>
{
}

public class DeliveryChallanDto
{
    public Guid Id { get; set; }
    public string ChallanNumber { get; set; }
    public DateTime ChallanDate { get; set; }
    public string CustomerName { get; set; }
    public string Status { get; set; }
    public decimal TotalItems { get; set; } // Just a summary count
}

public class GetDeliveryChallansQueryHandler : IRequestHandler<GetDeliveryChallansQuery, List<DeliveryChallanDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetDeliveryChallansQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<DeliveryChallanDto>> Handle(GetDeliveryChallansQuery request, CancellationToken cancellationToken)
    {
        return await _context.DeliveryChallans
            .Include(x => x.Customer)
            .OrderByDescending(x => x.ChallanDate)
            .Select(x => new DeliveryChallanDto
            {
                Id = x.Id,
                ChallanNumber = x.ChallanNumber,
                ChallanDate = x.ChallanDate,
                CustomerName = x.Customer.Name,
                Status = x.Status.ToString(),
                TotalItems = x.Lines.Count
            })
            .ToListAsync(cancellationToken);
    }
}
