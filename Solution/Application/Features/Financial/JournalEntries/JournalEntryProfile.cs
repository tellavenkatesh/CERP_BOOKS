using AutoMapper;
using CompreoBooks.Domain.Entities.Financial;
using CompreoBooks.Application.Features.Financial.JournalEntries.DTOs;

namespace CompreoBooks.Application.Features.Financial.JournalEntries;

public class JournalEntryProfile : Profile
{
    public JournalEntryProfile()
    {
        CreateMap<JournalEntry, JournalEntryDto>();
        CreateMap<JournalEntryLine, JournalEntryLineDto>()
            .ForMember(d => d.AccountName, opt => opt.MapFrom(s => s.Account.Name))
            .ForMember(d => d.PartyName, opt => opt.MapFrom(s => s.Party != null ? s.Party.Name : null));
    }
}
