using MediatR;
using CompreoBooks.Application.Common.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Application.Features.Identity.Commands.UpdateUser;

public record ResetPasswordCommand(Guid UserId, string NewPassword) : IRequest<bool>;

public class ResetPasswordHandler : IRequestHandler<ResetPasswordCommand, bool>
{
    private readonly IIdentityService _identityService;

    public ResetPasswordHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<bool> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        return await _identityService.ResetPasswordAsync(request.UserId, request.NewPassword);
    }
}
