using Microsoft.AspNetCore.Mvc;
using MiniERP.Application.Common.Exceptions;
using MiniERP.Application.Common.Interfaces;
using MiniERP.Application.DTOs;
using MiniERP.Domain.Entities.System;

namespace MiniERP.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class UsersController(
    IUserRepository userRepository,
    IUnitOfWork unitOfWork) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<UserResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var users = await userRepository.GetAllAsync(cancellationToken);
        
        // Sembrar usuarios por defecto si la tabla está vacía
        if (users.Count == 0)
        {
            var seedUsers = new List<User>
            {
                new("admin", "admin@amexcourier.pe", "Administrador General", "Admin2026!", "Administrador General", "Dashboard,Clientes,Expedientes DNI,Bodega Miami,Tingo Maria,Sede Lince,Reparto Carro Amex,Rotulos,Finanzas,Configuracion,Usuarios"),
                new("operador_miami", "miami@amexcourier.pe", "Roberto Gomez (Miami Hub)", "Miami2026!", "Operador Bodega Miami", "Bodega Miami,Expedientes DNI"),
                new("operador_tingo", "tingo@amexcourier.pe", "Manuel Silva (Tingo Maria 3PL)", "Tingo2026!", "Operador Tingo Maria", "Tingo Maria,Sede Lince"),
                new("chofer_amex", "chofer@amexcourier.pe", "Juan Perez (Movilidad Amex)", "Chofer2026!", "Chofer Reparto Amex", "Reparto Carro Amex"),
                new("cajero_lince", "caja@amexcourier.pe", "Lucia Delgado (Sede Lince)", "Caja2026!", "Cajero / Liquidador Lince", "Sede Lince,Finanzas,Rotulos")
            };

            foreach (var u in seedUsers)
            {
                await userRepository.AddAsync(u, cancellationToken);
            }
            await unitOfWork.SaveChangesAsync(cancellationToken);
            users = await userRepository.GetAllAsync(cancellationToken);
        }

        var result = users.Select(u => new UserResponse(
            u.Id,
            u.Username,
            u.Email,
            u.FullName,
            u.RoleName,
            u.CustomPermissions,
            u.IsActive,
            u.LastLoginAt,
            u.CreatedAt
        )).ToList();

        return Ok(result);
    }

    [HttpGet("roles")]
    public ActionResult<List<RoleDefinitionResponse>> GetRoles()
    {
        var roles = new List<RoleDefinitionResponse>
        {
            new("Administrador General", "Acceso ilimitado a todos los módulos y parámetros del sistema.", new() { "Dashboard", "Clientes", "Expedientes DNI", "Bodega Miami", "Tingo Maria", "Sede Lince", "Reparto Carro Amex", "Rotulos", "Finanzas", "Configuracion", "Usuarios" }),
            new("Operador Bodega Miami", "Ingesta de paquetes en Miami, registro de Invoices y manifiestos 3PL.", new() { "Bodega Miami", "Expedientes DNI" }),
            new("Operador Tingo Maria", "Control de desaduanaje 3PL Tib Courier y transferencias inter-almacén a Lince.", new() { "Tingo Maria", "Sede Lince" }),
            new("Chofer Reparto Amex", "Acceso a Hoja de Ruta del vehículo Amex y entrega a domicilio con GPS/WhatsApp.", new() { "Reparto Carro Amex" }),
            new("Cajero / Liquidador Lince", "Liquidación de fletes, cobro en Soles/Dólares (Yape/BCP) y emisión de rótulos.", new() { "Sede Lince", "Finanzas", "Rotulos" })
        };

        return Ok(roles);
    }

    [HttpPost]
    public async Task<ActionResult<UserResponse>> Create([FromBody] CreateUserRequest request, CancellationToken cancellationToken)
    {
        var existing = await userRepository.GetByUsernameAsync(request.Username, cancellationToken);
        if (existing != null)
            throw new ValidationException($"El nombre de usuario '{request.Username}' ya se encuentra registrado.");

        var user = new User(
            request.Username,
            request.Email,
            request.FullName,
            request.Password,
            request.RoleName,
            request.CustomPermissions
        );

        await userRepository.AddAsync(user, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var response = new UserResponse(
            user.Id,
            user.Username,
            user.Email,
            user.FullName,
            user.RoleName,
            user.CustomPermissions,
            user.IsActive,
            user.LastLoginAt,
            user.CreatedAt
        );

        return CreatedAtAction(nameof(GetAll), new { id = user.Id }, response);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserResponse>> Update(Guid id, [FromBody] UpdateUserRequest request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("User", id);

        user.UpdateDetails(
            request.Email,
            request.FullName,
            request.RoleName,
            request.CustomPermissions
        );

        userRepository.Update(user);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var response = new UserResponse(
            user.Id,
            user.Username,
            user.Email,
            user.FullName,
            user.RoleName,
            user.CustomPermissions,
            user.IsActive,
            user.LastLoginAt,
            user.CreatedAt
        );

        return Ok(response);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateUserStatusRequest request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("User", id);

        user.UpdateStatus(request.IsActive);
        userRepository.Update(user);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Ok(new { message = $"Estado del usuario '{user.Username}' actualizado a {(user.IsActive ? "Activo" : "Inactivo")}." });
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserResponse>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByUsernameAsync(request.Username, cancellationToken);
        if (user == null || !user.VerifyPassword(request.Password))
        {
            return Unauthorized(new { error = "Credenciales incorrectas. Verifique usuario y contraseña." });
        }

        if (!user.IsActive)
        {
            return StatusCode(403, new { error = "El usuario se encuentra inactivo en el sistema. Contacte al administrador." });
        }

        user.RecordLogin();
        userRepository.Update(user);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var response = new UserResponse(
            user.Id,
            user.Username,
            user.Email,
            user.FullName,
            user.RoleName,
            user.CustomPermissions,
            user.IsActive,
            user.LastLoginAt,
            user.CreatedAt
        );

        return Ok(response);
    }
}
