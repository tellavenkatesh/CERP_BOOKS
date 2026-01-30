using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.AI.DTOs;
using MediatR;

namespace CompreoBooks.Application.Features.AI.Commands;

public record ChatWithAiCommand(string UserMessage) : IRequest<ChatResponse>;

public class ChatWithAiCommandHandler : IRequestHandler<ChatWithAiCommand, ChatResponse>
{
    private readonly IAiService _aiService;
    private readonly IMediator _mediator;

    public ChatWithAiCommandHandler(IAiService aiService, IMediator mediator)
    {
        _aiService = aiService;
        _mediator = mediator;
    }

    public async Task<ChatResponse> Handle(ChatWithAiCommand request, CancellationToken cancellationToken)
    {
        // 1. Fetch Real-time Dashboard Stats (Default: This Month)
        var stats = await _mediator.Send(new CompreoBooks.Application.Features.Reports.Queries.GetDashboardStatsQuery(), cancellationToken);

        // 2. Format Context for AI
        var context = $@"
CURRENT FINANCIAL DATA (This Month):
- Revenue: ₹{stats.TotalRevenue:N2}
- Expenses: ₹{stats.TotalExpenses:N2}
- Receivables (Total): ₹{stats.TotalReceivables:N2}
- Receivables (Overdue): ₹{stats.OverdueReceivables:N2}
- Payables (Total): ₹{stats.TotalPayables:N2}
- Payables (Upcoming): ₹{stats.UpcomingPayables:N2}
";
        
        // 3. Call AI with Context
        return await _aiService.ChatAsync(request.UserMessage, contextData: context);
    }
}
