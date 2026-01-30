using AutoMapper;
using CompreoBooks.Application.Features.Purchase.DTOs;
using CompreoBooks.Domain.Entities.Purchase;

namespace CompreoBooks.Application.Features.Purchase;

public class PurchaseProfile : Profile
{
    public PurchaseProfile()
    {
        CreateMap<PurchaseOrder, PurchaseOrderDto>()
            .ForMember(d => d.VendorName, opt => opt.MapFrom(s => s.Vendor.Name))
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()));

        CreateMap<PurchaseOrderItem, PurchaseOrderItemDto>()
            .ForMember(d => d.ItemName, opt => opt.MapFrom(s => s.Item.Name));

        CreateMap<Grn, GrnDto>()
            .ForMember(d => d.VendorName, opt => opt.MapFrom(s => s.Vendor.Name))
            .ForMember(d => d.PurchaseOrderNumber, opt => opt.MapFrom(s => s.PurchaseOrder != null ? s.PurchaseOrder.OrderNumber : string.Empty))
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()));

        CreateMap<GrnItem, GrnItemDto>()
            .ForMember(d => d.ItemName, opt => opt.MapFrom(s => s.Item.Name));

        CreateMap<Bill, BillDto>()
            .ForMember(d => d.VendorName, opt => opt.MapFrom(s => s.Vendor.Name))
            .ForMember(d => d.PurchaseOrderNumber, opt => opt.MapFrom(s => s.PurchaseOrder != null ? s.PurchaseOrder.OrderNumber : string.Empty))
            .ForMember(d => d.GrnNumber, opt => opt.MapFrom(s => s.Grn != null ? s.Grn.GrnNumber : string.Empty))
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()));

        CreateMap<BillLine, BillLineDto>()
            .ForMember(d => d.ItemName, opt => opt.MapFrom(s => s.Item.Name));
    }
}
