using AutoMapper;
using CompreoBooks.Domain.Entities.Financial;
using CompreoBooks.Application.Features.Financial.Receipts.DTOs;

namespace CompreoBooks.Application.Features.Financial.Receipts;

public class ReceiptsProfile : Profile
{
    public ReceiptsProfile()
    {
        CreateMap<Receipt, ReceiptDto>()
            .ForMember(d => d.CustomerName, opt => opt.MapFrom(s => s.Customer.Name));
    }
}
