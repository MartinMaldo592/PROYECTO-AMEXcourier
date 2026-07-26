using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using MiniERP.Application.Common.Exceptions;
using MiniERP.Domain.Exceptions;

namespace MiniERP.API.Middleware;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        logger.LogError(exception, "Ha ocurrido un error no controlado: {Message}", exception.Message);

        var (statusCode, title, detail) = exception switch
        {
            DomainException domainEx => (StatusCodes.Status400BadRequest, "Error de Regla de Negocio", domainEx.Message),
            ValidationException valEx => (StatusCodes.Status400BadRequest, "Error de Validación", valEx.Message),
            NotFoundException notFoundEx => (StatusCodes.Status404NotFound, "Recurso No Encontrado", notFoundEx.Message),
            _ => (StatusCodes.Status500InternalServerError, "Error Interno del Servidor", "Ocurrió un error inesperado al procesar la solicitud.")
        };

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path
        };

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}
