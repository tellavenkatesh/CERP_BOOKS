using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.AI.DTOs;
using MediatR;

namespace CompreoBooks.Application.Features.AI.Queries;

public record GetSmartCategorizationQuery(string Description, decimal Amount, string Date) : IRequest<CategorizationResult>;

public class GetSmartCategorizationQueryHandler : IRequestHandler<GetSmartCategorizationQuery, CategorizationResult>
{
    private readonly IAiService _aiService;

    public GetSmartCategorizationQueryHandler(IAiService aiService)
    {
        _aiService = aiService;
    }

    public async Task<CategorizationResult> Handle(GetSmartCategorizationQuery request, CancellationToken cancellationToken)
    {
        return await _aiService.CategorizeTransactionAsync(request.Description, request.Amount, request.Date);
    }
}

public record GetAnomaliesQuery(object TransactionData) : IRequest<AnomalyResult>;

public class GetAnomaliesQueryHandler : IRequestHandler<GetAnomaliesQuery, AnomalyResult>
{
    private readonly IAiService _aiService;

    public GetAnomaliesQueryHandler(IAiService aiService)
    {
        _aiService = aiService;
    }

    public async Task<AnomalyResult> Handle(GetAnomaliesQuery request, CancellationToken cancellationToken)
    {
        return await _aiService.DetectAnomaliesAsync(request.TransactionData);
    }
}
