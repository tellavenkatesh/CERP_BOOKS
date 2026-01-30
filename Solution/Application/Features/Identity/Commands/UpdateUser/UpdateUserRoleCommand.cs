using MediatR;
using CompreoBooks.Application.Common.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Identity.Commands.UpdateUser;

public record UpdateUserRoleCommand(System.Guid UserId, string NewRole) : IRequest<bool>;

public class UpdateUserRoleHandler : IRequestHandler<UpdateUserRoleCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateUserRoleHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateUserRoleCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(new object[] { request.UserId }, cancellationToken);

        if (user == null)
            return false;

        user.Role = request.NewRole;
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
