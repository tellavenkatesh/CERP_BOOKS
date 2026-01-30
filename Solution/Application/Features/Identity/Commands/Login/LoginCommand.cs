using MediatR;
using CompreoBooks.Application.Common.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Identity.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<LoginResponse>;

public record LoginResponse(string Token, string FirstName, string LastName, string Role, bool HasCompany);

public class LoginHandler : IRequestHandler<LoginCommand, LoginResponse>
{
    private readonly IIdentityService _identityService;
    private readonly IApplicationDbContext _context;

    public LoginHandler(IIdentityService identityService, IApplicationDbContext context)
    {
        _identityService = identityService;
        _context = context;
    }

    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var (token, user) = await _identityService.LoginAsync(request.Email, request.Password);

        if (token == null || user == null)
            throw new System.UnauthorizedAccessException("Invalid email or password.");

        var hasCompany = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.AnyAsync(_context.Companies, cancellationToken);

        return new LoginResponse(token, user.FirstName, user.LastName, user.Role, hasCompany);
    }
}
