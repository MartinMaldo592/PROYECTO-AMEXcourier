namespace MiniERP.Application.DTOs;

public class CreateUserRequest
{
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string RoleName { get; set; } = null!;
    public string CustomPermissions { get; set; } = string.Empty;
}

public class UpdateUserRequest
{
    public string Email { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string RoleName { get; set; } = null!;
    public string CustomPermissions { get; set; } = string.Empty;
}

public class UpdateUserStatusRequest
{
    public bool IsActive { get; set; }
}

public record UserResponse(
    Guid Id,
    string Username,
    string Email,
    string FullName,
    string RoleName,
    string CustomPermissions,
    bool IsActive,
    DateTime? LastLoginAt,
    DateTime CreatedAt
);

public record RoleDefinitionResponse(
    string RoleName,
    string Description,
    List<string> Modules
);

public class LoginRequest
{
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
}
