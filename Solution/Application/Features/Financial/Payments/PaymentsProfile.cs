using AutoMapper;
using CompreoBooks.Domain.Entities.Financial;
using CompreoBooks.Application.Features.Financial.Payments.DTOs;

namespace CompreoBooks.Application.Features.Financial.Payments;

public class PaymentsProfile : Profile
{
    public PaymentsProfile()
    {
        CreateMap<Payment, PaymentDto>()
            .ForMember(d => d.VendorName, opt => opt.MapFrom(s => s.Vendor.Name));
    }
}
