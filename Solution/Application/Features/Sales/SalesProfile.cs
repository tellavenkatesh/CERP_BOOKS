using AutoMapper;
using CompreoBooks.Application.Features.Sales.DTOs;
using CompreoBooks.Domain.Entities.Sales;

namespace CompreoBooks.Application.Features.Sales;

public class SalesProfile : Profile
{
    public SalesProfile()
    {
        CreateMap<SalesOrder, SalesOrderDto>()
            .ForMember(d => d.CustomerName, opt => opt.MapFrom(s => s.Customer.Name))
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()));

        CreateMap<SalesOrderItem, SalesOrderItemDto>()
            .ForMember(d => d.ItemName, opt => opt.MapFrom(s => s.Item.Name));

        CreateMap<Invoice, InvoiceDto>()
            .ForMember(d => d.CustomerName, opt => opt.MapFrom(s => s.Customer.Name))
            .ForMember(d => d.SalesOrderNumber, opt => opt.MapFrom(s => s.SalesOrder != null ? s.SalesOrder.OrderNumber : null))
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()));

        CreateMap<InvoiceLine, InvoiceLineDto>()
            .ForMember(d => d.ItemName, opt => opt.MapFrom(s => s.Item.Name));

        CreateMap<Estimate, EstimateDto>()
            .ForMember(d => d.CustomerName, opt => opt.MapFrom(s => s.Customer.Name))
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()));

        CreateMap<EstimateItem, EstimateItemDto>()
            .ForMember(d => d.ItemName, opt => opt.MapFrom(s => s.Item.Name));
    }
}
