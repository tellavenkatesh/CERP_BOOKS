using LangChain.Providers;
using LangChain.Providers.Ollama;
using Microsoft.Extensions.Configuration;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CompreoBooks.Infrastructure.AI;

public class OllamaAIService : CompreoBooks.Application.Common.AI.IAIService
{
    private readonly OllamaProvider _provider;
    private readonly string _modelName;
    private readonly string _embeddingModelName;

    public OllamaAIService(IConfiguration configuration)
    {
        var url = configuration["AI:OllamaUrl"] ?? "http://localhost:11434";
        _provider = new OllamaProvider(url); 
        
        _modelName = configuration["AI:ModelName"] ?? "mistral";
        _embeddingModelName = configuration["AI:EmbeddingModelName"] ?? "all-minilm";
    }

    public async Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken cancellationToken)
    {
        var embeddingModel = new OllamaEmbeddingModel(_provider, _embeddingModelName);
        var response = await embeddingModel.CreateEmbeddingsAsync(text, cancellationToken: cancellationToken);
        return response.ToSingleArray(); 
    }

    public async Task<string> GenerateResponseAsync(string prompt, CancellationToken cancellationToken)
    {
        var chatModel = new OllamaChatModel(_provider, _modelName);
        var response = await chatModel.GenerateAsync(prompt, cancellationToken: cancellationToken);
        return response.ToString();
    }
}
