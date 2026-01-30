using AutoMapper;
using CompreoBooks.Application.Features.Companies.DTOs;
using CompreoBooks.Domain.Entities.Masters;

namespace CompreoBooks.Application.Features.Companies;

public class CompanyProfile : Profile
{
    public CompanyProfile()
    {
        CreateMap<Company, CompanyDto>().ReverseMap();
        CreateMap<CreateCompanyDto, Company>();
        CreateMap<UpdateCompanyDto, Company>();
    }
}
