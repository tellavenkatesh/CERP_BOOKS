using AutoMapper;
using CompreoBooks.Application.Features.Items.DTOs;
using CompreoBooks.Domain.Entities.Masters;

namespace CompreoBooks.Application.Features.Items;

public class ItemProfile : Profile
{
    public ItemProfile()
    {
        CreateMap<Item, ItemDto>().ReverseMap();
        CreateMap<CreateItemDto, Item>();
    }
}
