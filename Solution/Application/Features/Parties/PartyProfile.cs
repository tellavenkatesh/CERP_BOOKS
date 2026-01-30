using AutoMapper;
using CompreoBooks.Application.Features.Parties.DTOs;
using CompreoBooks.Domain.Entities.Masters;

namespace CompreoBooks.Application.Features.Parties;

public class PartyProfile : Profile
{
    public PartyProfile()
    {
        CreateMap<Party, PartyDto>().ReverseMap();
        CreateMap<CreatePartyDto, Party>()
            .ForMember(d => d.BankName, o => o.MapFrom(s => s.BankName ?? string.Empty))
            .ForMember(d => d.BankAccountNumber, o => o.MapFrom(s => s.BankAccountNumber ?? string.Empty))
            .ForMember(d => d.BankIfscCode, o => o.MapFrom(s => s.BankIfscCode ?? string.Empty))
            .ForMember(d => d.ContactPerson, o => o.MapFrom(s => s.ContactPerson ?? string.Empty))
            .ForMember(d => d.Email, o => o.MapFrom(s => s.Email ?? string.Empty))
            .ForMember(d => d.Phone, o => o.MapFrom(s => s.Phone ?? string.Empty))
            .ForMember(d => d.Mobile, o => o.MapFrom(s => s.Mobile ?? string.Empty))
            .ForMember(d => d.BillingAddress, o => o.MapFrom(s => s.BillingAddress ?? string.Empty))
            .ForMember(d => d.BillingCity, o => o.MapFrom(s => s.BillingCity ?? string.Empty))
            .ForMember(d => d.BillingState, o => o.MapFrom(s => s.BillingState ?? string.Empty))
            .ForMember(d => d.BillingCountry, o => o.MapFrom(s => s.BillingCountry ?? string.Empty))
            .ForMember(d => d.BillingPincode, o => o.MapFrom(s => s.BillingPincode ?? string.Empty))
            .ForMember(d => d.ShippingAddress, o => o.MapFrom(s => s.ShippingAddress ?? string.Empty))
            .ForMember(d => d.GstIn, o => o.MapFrom(s => s.GstIn ?? string.Empty))
            .ForMember(d => d.PanNumber, o => o.MapFrom(s => s.PanNumber ?? string.Empty))
            .ForMember(d => d.Notes, o => o.MapFrom(s => s.Notes ?? string.Empty))
            
            // New Fields Mapping
            .ForMember(d => d.Salutation, o => o.MapFrom(s => s.Salutation ?? string.Empty))
            .ForMember(d => d.FirstName, o => o.MapFrom(s => s.FirstName ?? string.Empty))
            .ForMember(d => d.LastName, o => o.MapFrom(s => s.LastName ?? string.Empty))
            .ForMember(d => d.CompanyName, o => o.MapFrom(s => s.CompanyName ?? string.Empty))
            .ForMember(d => d.Website, o => o.MapFrom(s => s.Website ?? string.Empty))
            .ForMember(d => d.SkypeName, o => o.MapFrom(s => s.SkypeName ?? string.Empty))
            .ForMember(d => d.Designation, o => o.MapFrom(s => s.Designation ?? string.Empty))
            .ForMember(d => d.Department, o => o.MapFrom(s => s.Department ?? string.Empty))
            .ForMember(d => d.Twitter, o => o.MapFrom(s => s.Twitter ?? string.Empty))
            .ForMember(d => d.Facebook, o => o.MapFrom(s => s.Facebook ?? string.Empty))
            .ForMember(d => d.PlaceOfSupply, o => o.MapFrom(s => s.PlaceOfSupply ?? string.Empty))
            .ForMember(d => d.TaxPreference, o => o.MapFrom(s => s.TaxPreference ?? "Taxable"))
            .ForMember(d => d.Currency, o => o.MapFrom(s => s.Currency ?? "INR"))
            .ForMember(d => d.PortalEnabled, o => o.MapFrom(s => s.PortalEnabled))
            .ForMember(d => d.PortalLanguage, o => o.MapFrom(s => s.PortalLanguage ?? "English"))
            
            // Detailed Address Mapping
            .ForMember(d => d.BillingAttention, o => o.MapFrom(s => s.BillingAttention ?? string.Empty))
            .ForMember(d => d.BillingStreet2, o => o.MapFrom(s => s.BillingStreet2 ?? string.Empty))
            .ForMember(d => d.BillingPhone, o => o.MapFrom(s => s.BillingPhone ?? string.Empty))
            .ForMember(d => d.BillingFax, o => o.MapFrom(s => s.BillingFax ?? string.Empty))
            .ForMember(d => d.ShippingAttention, o => o.MapFrom(s => s.ShippingAttention ?? string.Empty))
            .ForMember(d => d.ShippingStreet2, o => o.MapFrom(s => s.ShippingStreet2 ?? string.Empty))
            .ForMember(d => d.ShippingCity, o => o.MapFrom(s => s.ShippingCity ?? string.Empty))
            .ForMember(d => d.ShippingState, o => o.MapFrom(s => s.ShippingState ?? string.Empty))
            .ForMember(d => d.ShippingCountry, o => o.MapFrom(s => s.ShippingCountry ?? string.Empty))
            .ForMember(d => d.ShippingPincode, o => o.MapFrom(s => s.ShippingPincode ?? string.Empty))
            .ForMember(d => d.ShippingPhone, o => o.MapFrom(s => s.ShippingPhone ?? string.Empty))
            .ForMember(d => d.ShippingPhone, o => o.MapFrom(s => s.ShippingPhone ?? string.Empty))
            .ForMember(d => d.ShippingFax, o => o.MapFrom(s => s.ShippingFax ?? string.Empty))
            .ForMember(d => d.ContactPersons, o => o.MapFrom(s => s.ContactPersons));
            
        CreateMap<ContactPerson, ContactPersonDto>().ReverseMap();
    }
}
