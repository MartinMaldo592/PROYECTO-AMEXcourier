using System.Text;
using MiniERP.Domain.Common;
using MiniERP.Domain.Exceptions;

namespace MiniERP.Domain.Entities.System;

public class User : BaseEntity
{
    public string Username { get; private set; } = null!;
    public string Email { get; private set; } = null!;
    public string FullName { get; private set; } = null!;
    public string PasswordHash { get; private set; } = null!;
    public string RoleName { get; private set; } = null!; // Administrador, Operador Miami, Operador Tingo Maria, Chofer Reparto Amex, Cajero Lince
    public string CustomPermissions { get; private set; } = string.Empty; // Módulos permitidos separados por coma
    public bool IsActive { get; private set; }
    public DateTime? LastLoginAt { get; private set; }

    private User() { }

    public User(string username, string email, string fullName, string password, string roleName, string customPermissions = "")
    {
        if (string.IsNullOrWhiteSpace(username)) throw new DomainException("El nombre de usuario es obligatorio.");
        if (string.IsNullOrWhiteSpace(email)) throw new DomainException("El email es obligatorio.");
        if (string.IsNullOrWhiteSpace(fullName)) throw new DomainException("El nombre completo es obligatorio.");
        if (string.IsNullOrWhiteSpace(roleName)) throw new DomainException("El rol del usuario es obligatorio.");

        Username = username.Trim().ToLowerInvariant();
        Email = email.Trim().ToLowerInvariant();
        FullName = fullName.Trim();
        PasswordHash = HashPassword(password);
        RoleName = roleName.Trim();
        CustomPermissions = customPermissions?.Trim() ?? string.Empty;
        IsActive = true;
    }

    public void UpdateDetails(string email, string fullName, string roleName, string customPermissions)
    {
        if (string.IsNullOrWhiteSpace(email)) throw new DomainException("El email es obligatorio.");
        if (string.IsNullOrWhiteSpace(fullName)) throw new DomainException("El nombre completo es obligatorio.");
        if (string.IsNullOrWhiteSpace(roleName)) throw new DomainException("El rol del usuario es obligatorio.");

        Email = email.Trim().ToLowerInvariant();
        FullName = fullName.Trim();
        RoleName = roleName.Trim();
        CustomPermissions = customPermissions?.Trim() ?? string.Empty;
    }

    public void UpdateStatus(bool isActive)
    {
        IsActive = isActive;
    }

    public void RecordLogin()
    {
        LastLoginAt = DateTime.UtcNow;
    }

    private static string HashPassword(string password)
    {
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(password + "AmexCourierSalt2026"));
    }

    public bool VerifyPassword(string password)
    {
        return PasswordHash == HashPassword(password);
    }
}
