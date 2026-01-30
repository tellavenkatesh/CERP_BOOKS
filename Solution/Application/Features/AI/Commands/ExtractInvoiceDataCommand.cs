using System.Threading;
using System.Threading.Tasks;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Application.Features.AI.DTOs;
using MediatR;
// using Microsoft.AspNetCore.Http; // Removed

namespace CompreoBooks.Application.Features.AI.Commands;

public record ExtractInvoiceDataCommand(System.IO.Stream FileStream, string FileName) : IRequest<InvoiceExtractionResult>;

public class ExtractInvoiceDataCommandHandler : IRequestHandler<ExtractInvoiceDataCommand, InvoiceExtractionResult>
{
    private readonly IAiService _aiService;

    public ExtractInvoiceDataCommandHandler(IAiService aiService)
    {
        _aiService = aiService;
    }

    public async Task<InvoiceExtractionResult> Handle(ExtractInvoiceDataCommand request, CancellationToken cancellationToken)
    {
        return await _aiService.ExtractInvoiceDataAsync(request.FileStream, request.FileName);
    }
}
