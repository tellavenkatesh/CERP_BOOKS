using MediatR;
using CompreoBooks.Application.Common.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Identity.Commands.UpdateUser;

public record UpdateUserCommand(Guid UserId, string FirstName, string LastName, string Email, string Phone, System.Collections.Generic.List<string> Permissions) : IRequest<bool>;

public class UpdateUserHandler : IRequestHandler<UpdateUserCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateUserHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(new object[] { request.UserId }, cancellationToken);

        if (user == null)
            return false;

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;

        user.Phone = request.Phone;
        user.Permissions = request.Permissions ?? new System.Collections.Generic.List<string>();
        // user.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
