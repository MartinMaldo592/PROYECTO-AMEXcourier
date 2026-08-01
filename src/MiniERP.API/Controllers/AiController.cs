using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;

namespace MiniERP.API.Controllers;

/// <summary>
/// Controlador para análisis de documentos con IA (Gemini).
/// Requiere la clave API configurada en GeminiAI:ApiKey (appsettings / variable de entorno).
/// </summary>
[ApiController]
[Route("api/v1/ai")]
public class AiController : ControllerBase
{
    private const string GeminiModel = "gemini-3.5-flash-lite";
    private const string GeminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<AiController> _logger;
    private readonly string _geminiApiKey;

    public AiController(
        IHttpClientFactory httpClientFactory,
        ILogger<AiController> logger,
        IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _geminiApiKey = configuration["GeminiAI:ApiKey"] ?? "";
    }

    /// <summary>
    /// Analiza una factura/invoice PDF o imagen con Gemini AI y extrae:
    /// - Descripción del contenido
    /// - Peso aproximado (si figura en el documento)
    /// - Valor total en USD
    /// </summary>
    [HttpPost("analyze-invoice")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> AnalyzeInvoice(
        IFormFile invoiceFile,
        CancellationToken cancellationToken)
    {
        if (invoiceFile == null || invoiceFile.Length == 0)
            return BadRequest(new { error = "Debe proporcionar un archivo PDF o imagen para analizar." });

        // Convertir el archivo a base64
        byte[] fileBytes;
        using (var ms = new MemoryStream())
        {
            await invoiceFile.CopyToAsync(ms, cancellationToken);
            fileBytes = ms.ToArray();
        }
        var base64Content = Convert.ToBase64String(fileBytes);
        var mimeType = invoiceFile.ContentType switch
        {
            "image/jpeg" => "image/jpeg",
            "image/jpg"  => "image/jpeg",
            "image/png"  => "image/png",
            "image/webp" => "image/webp",
            _            => "application/pdf"  // default para PDFs
        };

        // Construir el prompt para Gemini
        var prompt = @"Eres un asistente experto en logística de importaciones y courier internacional. 
Se te proporciona una factura / invoice comercial de una compra en USA (Amazon, eBay, tienda online, etc.).

Analiza el documento y extrae la siguiente información en formato JSON estricto:
{
  ""numero_factura"": ""Número de factura o pedido/order number. Ejemplo: '113-6457029-2337029', 'INV-8891', 'B204891'"",
  ""descripcion"": ""Descripción concisa del contenido del paquete, máximo 120 caracteres. Incluye cantidad y nombre del producto. Ejemplo: '2x Auriculares Sony WH-1000XM5 Bluetooth Noise Cancelling'"",
  ""peso_kg"": 0.00,
  ""valor_usd"": 0.00
}

Reglas:
- ""numero_factura"": Extrae el número de orden, pedido o factura. Busca etiquetas como: 'Order #', 'Order Details #', 'Invoice #', 'Receipt #', 'Invoice Number', 'Order ID'. Si no existe un número claro, deja cadena vacía """".
- ""descripcion"": Sé específico con cantidad y nombre del producto/s principal/es. Si hay varios artículos, menciona los más costosos o representativos. Máximo 120 caracteres.
- ""peso_kg"": Si el documento menciona un peso (lbs o kg), conviértelo a kg (1 lb = 0.453592 kg). Si no hay peso, estima uno razonable basado en el tipo de producto (ej: electrónica pequeña ≈ 0.5-2 kg). Redondea a 2 decimales.
- ""valor_usd"": Extrae el total de la factura en USD. Busca: 'Order Total', 'Grand Total', 'Total Amount', 'Invoice Total'. Si está en otra moneda, conviértelo a USD aproximado. Solo el número, sin símbolos.

IMPORTANTE: Responde ÚNICAMENTE con el JSON válido, sin texto adicional, sin markdown, sin backticks.";

        // Construir el cuerpo de la solicitud para Gemini
        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new object[]
                    {
                        new
                        {
                            inline_data = new
                            {
                                mime_type = mimeType,
                                data = base64Content
                            }
                        },
                        new { text = prompt }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0.1,
                maxOutputTokens = 512,
                responseMimeType = "application/json"
            }
        };

        try
        {
            var client = _httpClientFactory.CreateClient("gemini");
            var jsonContent = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");

            if (string.IsNullOrEmpty(_geminiApiKey))
                return StatusCode(503, new { error = "Clave API de Gemini no configurada.", detail = "Configure 'GeminiAI:ApiKey' en appsettings.json o como variable de entorno GEMINIAIKEYAPI." });

            var url = $"{GeminiEndpoint}?key={_geminiApiKey}";
            var response = await client.PostAsync(url, jsonContent, cancellationToken);

            var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogInformation("[Gemini AI] Status: {Status}, Response: {Response}", response.StatusCode, responseBody);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("[Gemini AI] Error response: {Body}", responseBody);

                // Manejar quota/rate-limit de forma amigable
                if ((int)response.StatusCode == 429)
                {
                    return StatusCode(429, new
                    {
                        error = "Cuota de la API Gemini agotada o límite de velocidad alcanzado.",
                        detail = "La clave API ha alcanzado el límite de solicitudes del plan gratuito. Por favor, espere unos minutos e intente de nuevo, o configure una clave API con plan de pago en Google AI Studio (ai.google.dev).",
                        retryAfterSeconds = 60
                    });
                }

                return StatusCode(500, new { error = "Error al conectar con Gemini AI.", detail = responseBody });
            }

            // Parsear la respuesta de Gemini
            using var doc = JsonDocument.Parse(responseBody);
            var candidates = doc.RootElement.GetProperty("candidates");
            var firstCandidate = candidates[0];
            var content = firstCandidate.GetProperty("content");
            var parts = content.GetProperty("parts");
            var textContent = parts[0].GetProperty("text").GetString() ?? "{}";

            // Limpiar el texto por si viene con markdown
            textContent = textContent.Trim();
            if (textContent.StartsWith("```json")) textContent = textContent[7..];
            if (textContent.StartsWith("```")) textContent = textContent[3..];
            if (textContent.EndsWith("```")) textContent = textContent[..^3];
            textContent = textContent.Trim();

            // Parsear el JSON extraído
            using var extractedDoc = JsonDocument.Parse(textContent);
            var extracted = extractedDoc.RootElement;

            var numeroFactura = extracted.TryGetProperty("numero_factura", out var numProp) ? numProp.GetString() ?? "" : "";
            var descripcion = extracted.TryGetProperty("descripcion", out var descProp) ? descProp.GetString() ?? "" : "";
            var pesoKg = 0.0;
            if (extracted.TryGetProperty("peso_kg", out var pesoProp))
                pesoKg = pesoProp.ValueKind == JsonValueKind.Number ? pesoProp.GetDouble() : 0.0;
            var valorUsd = 0.0;
            if (extracted.TryGetProperty("valor_usd", out var valorProp))
                valorUsd = valorProp.ValueKind == JsonValueKind.Number ? valorProp.GetDouble() : 0.0;

            return Ok(new
            {
                numero_factura = numeroFactura,
                descripcion,
                peso_kg = Math.Round(pesoKg, 2),
                valor_usd = Math.Round(valorUsd, 2),
                modelo = GeminiModel,
                analizado_en = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Gemini AI] Excepción al analizar invoice");
            return StatusCode(500, new { error = "Error interno al procesar el análisis con IA.", detail = ex.Message });
        }
    }
}
