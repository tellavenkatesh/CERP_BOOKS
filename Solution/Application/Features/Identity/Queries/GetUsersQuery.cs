using MediatR;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Identity.Queries;

public record GetUsersQuery : IRequest<List<UserDto>>;

public record UserDto(System.Guid Id, string FirstName, string LastName, string Email, string Role, bool IsActive, System.DateTime CreatedAt);

public class GetUsersHandler : IRequestHandler<GetUsersQuery, List<UserDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUsersHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await _context.Users
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var userDtos = new List<UserDto>();
        foreach (var user in users)
        {
            userDtos.Add(new UserDto(user.Id, user.FirstName, user.LastName, user.Email, user.Role, user.IsActive, user.CreatedAt));
        }

        return userDtos;
    }
}
