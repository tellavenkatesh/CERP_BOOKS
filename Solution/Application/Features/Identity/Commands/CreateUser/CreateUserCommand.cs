using MediatR;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Identity;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Identity.Commands.CreateUser;

public record CreateUserCommand(string firstName, string lastName, string email, string password, string role, string phone, System.Collections.Generic.List<string> permissions) : IRequest<CreateUserResponse>;

public record CreateUserResponse(bool Success, string Message, System.Guid? UserId);

public class CreateUserHandler : IRequestHandler<CreateUserCommand, CreateUserResponse>
{
    private readonly IIdentityService _identityService;
    private readonly IApplicationDbContext _context;

    public CreateUserHandler(IIdentityService identityService, IApplicationDbContext context)
    {
        _identityService = identityService;
        _context = context;
    }

    public async Task<CreateUserResponse> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        // 1. Create Identity User
        var (success, error, user) = await _identityService.RegisterAsync(request.email, request.password, request.firstName, request.lastName);

        if (!success || user == null)
            return new CreateUserResponse(false, error ?? "Failed to create user", null);

        // 2. Set Role and Details
        if (!string.IsNullOrEmpty(request.role)) user.Role = request.role;
        user.Phone = request.phone;
        user.Permissions = request.permissions ?? new System.Collections.Generic.List<string>();
        
        await _context.SaveChangesAsync(cancellationToken);

        return new CreateUserResponse(true, "User created successfully", user.Id);
    }
}
