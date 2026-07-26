using Microsoft.EntityFrameworkCore;
using MiniERP.API.Middleware;
using MiniERP.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// 1. Agregar Servicios al contenedor IoC
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// HttpClient para Gemini AI (análisis de facturas con IA)
builder.Services.AddHttpClient("gemini", c =>
{
    c.Timeout = TimeSpan.FromSeconds(60);
    c.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
});

// Capa de Infraestructura
builder.Services.AddInfrastructure(builder.Configuration);

// Capa de Aplicación (Casos de Uso Courier Amex)
builder.Services.AddScoped<MiniERP.Application.UseCases.Courier.ReceivePackageUseCase>();
builder.Services.AddScoped<MiniERP.Application.UseCases.Courier.TransferPackageToLinceUseCase>();
builder.Services.AddScoped<MiniERP.Application.UseCases.Courier.LiquidateImportOrderUseCase>();
builder.Services.AddScoped<MiniERP.Application.UseCases.Courier.GenerateShippingLabelUseCase>();
builder.Services.AddScoped<MiniERP.Application.UseCases.Courier.UpdateDeliveryStatusUseCase>();
builder.Services.AddScoped<MiniERP.Application.UseCases.Courier.CreateShipmentUseCase>();
builder.Services.AddScoped<MiniERP.Application.UseCases.Courier.ReceiveShipmentInPeruUseCase>();

// Manejador global de excepciones (RFC 7807)
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

var app = builder.Build();

// Crear automáticamente la BD SQLite al arrancar si no existe o asegurar tablas
using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<MiniERP.Infrastructure.Persistence.ApplicationDbContext>();
        await dbContext.Database.EnsureCreatedAsync();
        await dbContext.Database.ExecuteSqlRawAsync(@"CREATE TABLE IF NOT EXISTS ""Users"" (""Id"" TEXT NOT NULL PRIMARY KEY, ""Username"" TEXT NOT NULL UNIQUE, ""Email"" TEXT NOT NULL, ""FullName"" TEXT NOT NULL, ""PasswordHash"" TEXT NOT NULL, ""RoleName"" TEXT NOT NULL, ""CustomPermissions"" TEXT NOT NULL DEFAULT '', ""IsActive"" INTEGER NOT NULL, ""LastLoginAt"" TEXT NULL, ""IsDeleted"" INTEGER NOT NULL, ""CreatedAt"" TEXT NOT NULL, ""UpdatedAt"" TEXT NULL);");
        
        try
        {
            await dbContext.Database.ExecuteSqlRawAsync(@"ALTER TABLE ""Users"" ADD COLUMN ""CustomPermissions"" TEXT NOT NULL DEFAULT '';");
        }
        catch { /* Ignorar si la columna ya existe */ }

        // Crear tabla Shipments (Guías Máster AMX)
        await dbContext.Database.ExecuteSqlRawAsync(@"CREATE TABLE IF NOT EXISTS ""Shipments"" (
            ""Id"" TEXT NOT NULL PRIMARY KEY,
            ""MasterGuideCode"" TEXT NOT NULL,
            ""PartnerRefNumber"" TEXT NULL,
            ""OriginWarehouse"" TEXT NOT NULL DEFAULT 'Tib Courier Miami',
            ""DestinationWarehouse"" TEXT NOT NULL DEFAULT 'Amex Lince / Tingo María',
            ""DispatchedFromMiamiAt"" TEXT NOT NULL,
            ""ReceivedInPeruAt"" TEXT NULL,
            ""Status"" TEXT NOT NULL DEFAULT 'EN_TRANSITO',
            ""Notes"" TEXT NULL,
            ""IsDeleted"" INTEGER NOT NULL DEFAULT 0,
            ""CreatedAt"" TEXT NOT NULL,
            ""UpdatedAt"" TEXT NULL
        );");

        // Crear tabla PackageTrackingLogs (Historial de Trazabilidad)
        await dbContext.Database.ExecuteSqlRawAsync(@"CREATE TABLE IF NOT EXISTS ""PackageTrackingLogs"" (
            ""Id"" TEXT NOT NULL PRIMARY KEY,
            ""PackageId"" TEXT NOT NULL,
            ""Location"" TEXT NOT NULL,
            ""EventDescription"" TEXT NOT NULL,
            ""OperatorUsername"" TEXT NULL,
            ""Timestamp"" TEXT NOT NULL,
            ""IsDeleted"" INTEGER NOT NULL DEFAULT 0,
            ""CreatedAt"" TEXT NOT NULL,
            ""UpdatedAt"" TEXT NULL,
            FOREIGN KEY (""PackageId"") REFERENCES ""Packages""(""Id"") ON DELETE CASCADE
        );");

        // Agregar columna ShipmentId a Packages si no existe
        try
        {
            await dbContext.Database.ExecuteSqlRawAsync(@"ALTER TABLE ""Packages"" ADD COLUMN ""ShipmentId"" TEXT NULL REFERENCES ""Shipments""(""Id"") ON DELETE SET NULL;");
        }
        catch { /* Ignorar si la columna ya existe */ }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[SQLite Init] Warning/Info: {ex.Message}");
    }
}

// 2. Configurar el Pipeline HTTP y Swagger UI
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "MiniERP API v1");
    c.RoutePrefix = "swagger";
});

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
