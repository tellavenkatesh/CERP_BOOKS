using CompreoBooks.Application.Common.Interfaces;
using CompreoBooks.Domain.Entities.Masters;
using MediatR;

namespace CompreoBooks.Application.Features.Settings.Commands.CreateInvoiceTemplate;

public record CreateInvoiceTemplateCommand : IRequest<int>
{
    public string Name { get; init; } = string.Empty;
    public string Layout { get; init; } = "classic";
    public string PrimaryColor { get; init; } = string.Empty;
    public string AccentColor { get; init; } = string.Empty;
    public string HeaderText { get; init; } = string.Empty;
    public string FooterText { get; init; } = string.Empty;
    public bool ShowBankDetails { get; init; }
    public string Logo { get; init; } = string.Empty;
    public bool IsDefault { get; init; }
    public bool IsActive { get; init; }
}

public class CreateInvoiceTemplateCommandHandler : IRequestHandler<CreateInvoiceTemplateCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CreateInvoiceTemplateCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateInvoiceTemplateCommand request, CancellationToken cancellationToken)
    {
        var entity = new InvoiceTemplate
        {
            Name = request.Name,
            Layout = request.Layout,
            PrimaryColor = request.PrimaryColor,
            AccentColor = request.AccentColor,
            HeaderText = request.HeaderText,
            FooterText = request.FooterText,
            ShowBankDetails = request.ShowBankDetails,
            Logo = request.Logo,
            IsDefault = request.IsDefault,
            IsActive = request.IsActive
        };

        if (request.IsDefault)
        {
            // Unset other defaults if this one is default
            var existingDefaults = _context.InvoiceTemplates.Where(t => t.IsDefault);
            foreach (var existing in existingDefaults)
            {
                existing.IsDefault = false;
            }
        }

        _context.InvoiceTemplates.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
