using AutoMapper;
using CompreoBooks.Application.Features.Accounts.DTOs;
using CompreoBooks.Domain.Entities.Masters;

namespace CompreoBooks.Application.Features.Accounts;

public class AccountProfile : Profile
{
    public AccountProfile()
    {
        CreateMap<Account, AccountDto>().ReverseMap();
        CreateMap<CreateAccountDto, Account>();
    }
}
