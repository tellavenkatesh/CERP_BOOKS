using MediatR;
using CompreoBooks.Application.Common.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Identity.Commands.UpdateUser;

public record ToggleUserStatusCommand(System.Guid UserId, bool IsActive) : IRequest<bool>;

public class ToggleUserStatusHandler : IRequestHandler<ToggleUserStatusCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public ToggleUserStatusHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ToggleUserStatusCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(new object[] { request.UserId }, cancellationToken);

        if (user == null)
            return false;

        user.IsActive = request.IsActive;
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
