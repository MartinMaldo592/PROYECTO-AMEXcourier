namespace MiniERP.Application.DTOs;

public record CreateCustomerRequest(string TaxId, string Name, string Email);

public record CustomerResponse(Guid Id, string TaxId, string Name, string Email, bool IsActive, DateTime CreatedAt);
