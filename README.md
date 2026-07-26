# 🚀 AMEX Courier ERP — MiniERP

> **Sistema de Gestión Operativa para empresas de Courier Internacional (Miami → Perú)**

[![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Swagger](https://img.shields.io/badge/Swagger-UI-85EA2D?logo=swagger&logoColor=black)](https://swagger.io/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?logo=google)](https://ai.google.dev/)

---

## 📋 Descripción

**AMEX Courier ERP** es una aplicación web full-stack construida con **ASP.NET Core 8** y una interfaz web SPA (Single Page Application) embebida. Está diseñada para operadores de courier que gestionan paquetes importados desde **Miami (USA) → Perú** (rutas: Tingo María → Almacén Lince AMEX).

### ✨ Características Principales

| Módulo | Descripción |
|--------|-------------|
| 📦 **Paquetes (Packages)** | Recepción en Miami, trazabilidad completa, generación de etiquetas |
| 🚚 **Guías Máster (Shipments)** | Gestión de cargamentos AMX, asignación masiva de paquetes |
| 👥 **Clientes (Customers)** | Registro con Locker Code AMEX-PER-XXXX, carga de DNI |
| 📑 **Órdenes de Importación** | Liquidación aduanera, fraccionamiento multi-DNI |
| 🤖 **IA Invoice Analyzer** | Análisis automático de facturas con Google Gemini AI |
| 👤 **Usuarios / Roles** | Sistema de autenticación propio con roles y permisos |

---

## 🏗️ Arquitectura

El proyecto sigue **Clean Architecture** con 4 capas:

```
MiniERP.sln
├── src/
│   ├── MiniERP.Domain/          # Entidades, Value Objects, Enums, Reglas de Negocio
│   ├── MiniERP.Application/     # Casos de Uso (Use Cases), DTOs, Interfaces
│   ├── MiniERP.Infrastructure/  # Persistencia EF Core + SQLite, Repositorios
│   └── MiniERP.API/             # Controladores REST, Middleware, SPA Frontend
```

### 🔑 Entidades del Dominio

- **`Package`** — Paquete con tracking USA, ubicación actual, estado aduanero, método de entrega
- **`Shipment`** — Guía Máster AMEX (agrupa múltiples paquetes en un solo envío)
- **`Customer`** — Cliente con Locker Code único, datos de entrega, DNI
- **`ImportOrder`** — Orden de liquidación aduanera con pagos en PEN/USD
- **`PackageTrackingLog`** — Historial completo de eventos por paquete

### 📍 Flujo Operativo

```
Miami (Tib Courier) → [Recepción] → [Guía Máster AMX] → [En Tránsito]
    → Tingo María → [Arribo] → Almacén Lince AMEX
    → [Liquidación] → Entrega: {Carro AMEX | Recojo Lince | Agencia Nacional}
```

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|-----------|
| **Backend** | ASP.NET Core 8 (Minimal Hosting) |
| **ORM** | Entity Framework Core 9 + SQLite |
| **API Docs** | Swagger / OpenAPI 3.0 |
| **Frontend** | HTML5 + Vanilla JS (SPA embebida en `wwwroot`) |
| **IA** | Google Gemini 2.0 Flash Lite (análisis de facturas) |
| **Patrón** | Clean Architecture + Repository Pattern + Unit of Work |

---

## ⚡ Inicio Rápido

### Prerrequisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) o superior
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/MartinMaldo592/PROYECTO-AMEXcourier.git
cd PROYECTO-AMEXcourier
```

### 2. Configurar la API Key de Gemini (opcional, para módulo IA)

Edita `src/MiniERP.API/appsettings.json`:

```json
{
  "GeminiAI": {
    "ApiKey": "TU_API_KEY_AQUI"
  }
}
```

> **Obtén tu API Key gratuita** en [Google AI Studio](https://aistudio.google.com/app/apikey)

O bien, configura la variable de entorno:

```powershell
$env:GeminiAI__ApiKey = "TU_API_KEY_AQUI"
```

### 3. Ejecutar el servidor

**Opción A — PowerShell (Windows):**
```powershell
.\start_server.ps1
```

**Opción B — Directamente con dotnet:**
```bash
dotnet run --project src/MiniERP.API/MiniERP.API.csproj
```

### 4. Acceder a la aplicación

| URL | Descripción |
|-----|-------------|
| `http://localhost:5000` | Interfaz Web (SPA) |
| `http://localhost:5000/swagger` | Swagger UI / API Explorer |

> La base de datos SQLite (`minierp.db`) se crea automáticamente al primer arranque.

---

## 📡 API Reference

Base URL: `http://localhost:5000/api/v1`

### Packages

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/packages` | Listar todos los paquetes |
| `GET` | `/packages/{id}/tracking-history` | Historial de trazabilidad |
| `GET` | `/packages/{id}/shipping-label` | Generar etiqueta de envío |
| `GET` | `/packages/amex-vehicle-manifest` | Manifiesto de carro AMEX |
| `POST` | `/packages/receive-miami` | Recibir paquete en Miami |
| `POST` | `/packages/transfer-to-lince` | Trasladar a Almacén Lince |
| `POST` | `/packages/mark-arrived-tingo-maria/{id}` | Registrar arribo a Tingo María |
| `POST` | `/packages/update-delivery-status` | Actualizar estado de entrega |
| `POST` | `/packages/{id}/upload-invoice-pdf` | Adjuntar PDF de factura |

### Shipments (Guías Máster)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/shipments` | Listar guías máster |
| `GET` | `/shipments/{id}` | Detalle de una guía |
| `POST` | `/shipments` | Crear guía máster |
| `POST` | `/shipments/{id}/assign-packages` | Asignar paquetes a guía |
| `POST` | `/shipments/{id}/receive-peru` | Registrar recepción en Perú |

### Customers

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/customers` | Listar clientes |
| `POST` | `/customers` | Crear cliente (auto-genera Locker Code) |
| `POST` | `/customers/{id}/upload-dni` | Cargar imagen de DNI |

### AI

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/ai/analyze-invoice` | Analizar factura con Gemini AI |

---

## 🗂️ Estructura de Carpetas

```
PROYECTO-AMEXcourier/
├── src/
│   ├── MiniERP.Domain/
│   │   ├── Common/              # BaseEntity, interfaces base
│   │   ├── Entities/
│   │   │   ├── Courier/         # Package, Shipment, ImportOrder, TrackingLog
│   │   │   ├── SD/              # Customer
│   │   │   └── System/          # User
│   │   ├── Enums/               # PackageStatus, DeliveryMethod, WarehouseLocation...
│   │   └── Exceptions/          # DomainException
│   │
│   ├── MiniERP.Application/
│   │   ├── Common/
│   │   │   ├── Exceptions/      # NotFoundException, ValidationException
│   │   │   └── Interfaces/      # IPackageRepository, IUnitOfWork...
│   │   ├── DTOs/                # Request/Response records
│   │   └── UseCases/
│   │       └── Courier/         # ReceivePackage, TransferToLince, LiquidateOrder...
│   │
│   ├── MiniERP.Infrastructure/
│   │   ├── Persistence/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   ├── Configurations/  # EF Core Fluent API configs
│   │   │   ├── Interceptors/    # AuditInterceptor (CreatedAt/UpdatedAt)
│   │   │   └── Repositories/   # Implementaciones de repositorios
│   │   └── DependencyInjection.cs
│   │
│   └── MiniERP.API/
│       ├── Controllers/         # PackagesController, ShipmentsController...
│       ├── Middleware/          # GlobalExceptionHandler
│       ├── Properties/          # launchSettings.json
│       ├── wwwroot/             # SPA Frontend (index.html)
│       ├── Program.cs
│       └── appsettings.json
│
├── MiniERP.sln
├── start_server.ps1
├── stop_server.ps1
└── README.md
```

---

## ⚙️ Configuración Avanzada

### Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `ASPNETCORE_URLS` | URL donde escucha el servidor | `http://localhost:5000` |
| `ASPNETCORE_ENVIRONMENT` | Entorno (`Development`/`Production`) | `Development` |
| `GeminiAI__ApiKey` | API Key de Google Gemini | *(vacía — IA deshabilitada)* |
| `ConnectionStrings__DefaultConnection` | Cadena de conexión SQLite | `Data Source=minierp.db` |

### Categorías Aduaneras (SUNAT Perú)

| Categoría | Rango | Tratamiento |
|-----------|-------|-------------|
| `CategoryB_Under200` | Valor ≤ $200 USD | Sin impuestos de importación |
| `CategoryC_Over200` | Valor > $200 USD | Sujeto a tributos SUNAT |

### Estados del Paquete

```
ReceivedAtMiami → (en tránsito) → ArrivedAtTingoMaria → TransferredToAmexLince 
    → ReadyForPaymentAndDelivery → Delivered
```

### Métodos de Entrega Last-Mile

| Método | Descripción |
|--------|-------------|
| `LincePickup` | Cliente recoge en Almacén Lince |
| `AmexVehicleDelivery` | Entrega a domicilio con carro AMEX |
| `NationalAgency` | Envío por agencia nacional (Shalom, Olva, etc.) |

---

## 🤖 Módulo de Inteligencia Artificial

El endpoint `POST /api/v1/ai/analyze-invoice` recibe un archivo PDF o imagen de una factura americana (Amazon, eBay, tiendas online) y devuelve:

```json
{
  "numero_factura": "113-6457029-2337029",
  "descripcion": "2x Auriculares Sony WH-1000XM5 Bluetooth Noise Cancelling",
  "peso_kg": 1.2,
  "valor_usd": 349.99,
  "modelo": "gemini-2.0-flash-lite",
  "analizado_en": "2025-01-15T10:30:00Z"
}
```

**Formatos soportados:** PDF, JPG, PNG, WebP

---

## 🚧 Desarrollo Local

```bash
# Restaurar dependencias
dotnet restore

# Compilar solución completa
dotnet build

# Ejecutar en modo desarrollo (con hot-reload)
dotnet watch run --project src/MiniERP.API/MiniERP.API.csproj
```

---

## 🔒 Seguridad

- ⚠️ **NUNCA** commits keys API en el código fuente
- La clave de Gemini se lee desde `GeminiAI:ApiKey` en `appsettings.json` (excluido de producción) o como variable de entorno
- El archivo `.gitignore` excluye `*.db`, `appsettings.*.json`, y la carpeta `uploads/`
- Los archivos de DNI e invoices se almacenan en `wwwroot/uploads/` (no se versionan)

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Ver [LICENSE](LICENSE) para más detalles.

---

## 👤 Autor

**Martin Maldo** — [@MartinMaldo592](https://github.com/MartinMaldo592)

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz un fork del proyecto
2. Crea tu rama: `git checkout -b feature/mi-nueva-funcionalidad`
3. Haz commit: `git commit -m 'feat: agrega funcionalidad X'`
4. Push: `git push origin feature/mi-nueva-funcionalidad`
5. Abre un Pull Request

---

*Desarrollado con ❤️ para optimizar operaciones de courier internacional Miami–Perú*
