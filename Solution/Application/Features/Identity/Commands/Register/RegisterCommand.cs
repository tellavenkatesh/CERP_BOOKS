using MediatR;
using CompreoBooks.Application.Common.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Identity.Commands.Register;

public record RegisterCommand(string Email, string Password, string FirstName, string LastName) : IRequest<RegisterResponse>;

public record RegisterResponse(bool Success, string Message);

public class RegisterHandler : IRequestHandler<RegisterCommand, RegisterResponse>
{
    private readonly IIdentityService _identityService;

    public RegisterHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<RegisterResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var (success, error, user) = await _identityService.RegisterAsync(request.Email, request.Password, request.FirstName, request.LastName);

        if (!success)
            throw new System.Exception(error ?? "Registration failed.");

        return new RegisterResponse(true, "User registered successfully.");
    }
}
