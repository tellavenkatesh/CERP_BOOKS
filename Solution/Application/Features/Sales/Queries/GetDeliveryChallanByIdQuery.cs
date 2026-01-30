using AutoMapper;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Sales;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CompreoBooks.Application.Features.Sales.Queries;

public record GetDeliveryChallanByIdQuery(Guid Id) : IRequest<DeliveryChallanDetailDto?>;

public class DeliveryChallanDetailDto
{
    public Guid Id { get; set; }
    public string? ChallanNumber { get; set; }
    public DateTime ChallanDate { get; set; }
    public Guid CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public Guid? SalesOrderId { get; set; }
    public string? SalesOrderNumber { get; set; }
    public string? DeliveryAddress { get; set; }
    public string? VehicleNumber { get; set; }
    public string? EWayBillNumber { get; set; }
    public string? Purpose { get; set; }
    public string? Status { get; set; }
    public string? Notes { get; set; }
    public List<DeliveryChallanLineDetailDto> Lines { get; set; } = new();
}

public class DeliveryChallanLineDetailDto
{
    public Guid Id { get; set; }
    public Guid ItemId { get; set; }
    public string? ItemName { get; set; }
    public string? Description { get; set; }
    public decimal OrderedQuantity { get; set; }
    public decimal DeliveredQuantity { get; set; }
}

public class GetDeliveryChallanByIdQueryHandler : IRequestHandler<GetDeliveryChallanByIdQuery, DeliveryChallanDetailDto?>
{
    private readonly IApplicationDbContext _context;

    public GetDeliveryChallanByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DeliveryChallanDetailDto?> Handle(GetDeliveryChallanByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.DeliveryChallans
            .Include(x => x.Customer)
            .Include(x => x.SalesOrder)
            .Include(x => x.Lines)
            .ThenInclude(l => l.Item)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
            
        if (entity == null) return null;

        return new DeliveryChallanDetailDto
        {
            Id = entity.Id,
            ChallanNumber = entity.ChallanNumber,
            ChallanDate = entity.ChallanDate,
            CustomerId = entity.CustomerId,
            CustomerName = entity.Customer.Name,
            SalesOrderId = entity.SalesOrderId,
            SalesOrderNumber = entity.SalesOrder?.OrderNumber,
            DeliveryAddress = entity.DeliveryAddress,
            VehicleNumber = entity.VehicleNumber,
            EWayBillNumber = entity.EWayBillNumber,
            Purpose = entity.Purpose.ToString(),
            Status = entity.Status.ToString(),
            Notes = entity.Notes,
            Lines = entity.Lines.Select(l => new DeliveryChallanLineDetailDto 
            {
                Id = l.Id,
                ItemId = l.ItemId,
                ItemName = l.Item.Name,
                Description = l.Description,
                OrderedQuantity = l.OrderedQuantity,
                DeliveredQuantity = l.DeliveredQuantity
            }).ToList()
        };
    }
}
