using Microsoft.AspNetCore.Mvc;
using MiniERP.Application.Common.Exceptions;
using MiniERP.Application.Common.Interfaces;
using MiniERP.Application.DTOs;
using MiniERP.Application.UseCases.Courier;
using MiniERP.Domain.Entities.Courier;

namespace MiniERP.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class PackagesController(
    ReceivePackageUseCase receivePackageUseCase,
    TransferPackageToLinceUseCase transferPackageToLinceUseCase,
    GenerateShippingLabelUseCase generateShippingLabelUseCase,
    UpdateDeliveryStatusUseCase updateDeliveryStatusUseCase,
    IPackageRepository packageRepository,
    IImportOrderRepository importOrderRepository,
    IUnitOfWork unitOfWork,
    IWebHostEnvironment environment) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<PackageResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var packages = await packageRepository.GetAllAsync(cancellationToken);
        var result = packages.Select(p => new PackageResponse(
            p.Id,
            p.TrackingUsa,
            p.WarehouseReceiptNumber,
            p.PackageType,
            p.CustomerId,
            p.Customer.Name,
            p.Customer.LockerCode,
            p.Description,
            p.WeightKg,
            p.DeclaredValueUsd,
            p.InvoiceNumber,
            p.CustomsDni,
            p.CustomsConsigneeName,
            p.MasterImporterCustomerId,
            p.InvoicePdfUrl,
            p.CurrentLocation.ToString(),
            p.Status.ToString(),
            p.DeliveryMethod.ToString(),
            p.DeliveryStatus.ToString(),
            p.CustomsCategory.ToString(),
            p.ReceivedMiamiAt,
            p.ArrivedTingoMariaAt,
            p.TransferredLinceAt,
            p.DeliveredAt,
            p.ShipmentId,
            p.Shipment?.MasterGuideCode
        )).ToList();

        return Ok(result);
    }

    [HttpGet("{packageId}/tracking-history")]
    public async Task<ActionResult<List<TrackingLogDto>>> GetTrackingHistory(Guid packageId, CancellationToken cancellationToken)
    {
        var package = await packageRepository.GetByIdAsync(packageId, cancellationToken);
        if (package == null) return NotFound(new { message = "Paquete no encontrado." });

        var logs = package.TrackingLogs
            .OrderByDescending(l => l.Timestamp)
            .Select(l => new TrackingLogDto(
                l.Id,
                l.PackageId,
                l.Location,
                l.EventDescription,
                l.OperatorUsername,
                l.Timestamp
            )).ToList();

        return Ok(logs);
    }

    [HttpGet("{packageId}/shipping-label")]
    public async Task<ActionResult<ShippingLabelResponse>> GetShippingLabel(Guid packageId, CancellationToken cancellationToken)
    {
        var label = await generateShippingLabelUseCase.ExecuteAsync(packageId, cancellationToken);
        return Ok(label);
    }

    [HttpGet("amex-vehicle-manifest")]
    public async Task<ActionResult<List<DriverVehicleRouteItem>>> GetAmexVehicleManifest(CancellationToken cancellationToken)
    {
        var packages = await packageRepository.GetAllAsync(cancellationToken);
        var orders = await importOrderRepository.GetAllAsync(cancellationToken);

        var vehiclePackages = packages.Where(p => p.DeliveryMethod == Domain.Enums.DeliveryMethod.AmexVehicleDelivery || p.DeliveryStatus == Domain.Enums.DeliveryStatus.InTransitAmexVehicle).ToList();

        var result = vehiclePackages.Select(p => {
            var order = orders.FirstOrDefault(o => o.PackageId == p.Id);
            return new DriverVehicleRouteItem(
                p.Id,
                p.WarehouseReceiptNumber,
                p.TrackingUsa,
                !string.IsNullOrWhiteSpace(p.CustomsConsigneeName) ? p.CustomsConsigneeName : p.Customer.Name,
                p.Customer.Phone,
                p.Customer.DeliveryAddress,
                p.Customer.Department,
                p.Customer.Province,
                p.Customer.District,
                p.Description,
                p.WeightKg,
                p.InvoiceNumber,
                order?.IsPaid ?? false,
                order?.PaymentCurrency ?? "PEN",
                order?.PaymentMethod ?? "YAPE",
                order?.TotalAmountUsd ?? 0,
                order?.TotalAmountPen ?? 0,
                p.DeliveryStatus.ToString()
            );
        }).ToList();

        return Ok(result);
    }

    [HttpPost("receive-miami")]
    public async Task<ActionResult<PackageResponse>> ReceiveInMiami([FromBody] ReceivePackageRequest request, CancellationToken cancellationToken)
    {
        var response = await receivePackageUseCase.ExecuteAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetAll), new { id = response.Id }, response);
    }

    [HttpPost("update-delivery-status")]
    public async Task<IActionResult> UpdateDeliveryStatus([FromBody] UpdateDeliveryStatusRequest request, CancellationToken cancellationToken)
    {
        await updateDeliveryStatusUseCase.ExecuteAsync(request, cancellationToken);
        return Ok(new { message = "Estado y modalidad de entrega actualizados correctamente." });
    }

    [HttpPost("{packageId}/upload-invoice-pdf")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<PackageResponse>> UploadInvoicePdf(
        Guid packageId,
        IFormFile invoiceFile,
        CancellationToken cancellationToken)
    {
        var package = await packageRepository.GetByIdAsync(packageId, cancellationToken)
            ?? throw new NotFoundException(nameof(Package), packageId);

        if (invoiceFile == null || invoiceFile.Length == 0)
            throw new ValidationException("Debe seleccionar un archivo PDF o imagen de la Invoice.");

        var uploadsFolder = Path.Combine(environment.WebRootPath, "uploads", "invoices");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{package.TrackingUsa}_{package.InvoiceNumber}{Path.GetExtension(invoiceFile.FileName)}";
        var filePath = Path.Combine(uploadsFolder, fileName);
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await invoiceFile.CopyToAsync(stream, cancellationToken);
        }

        var pdfUrl = $"/uploads/invoices/{fileName}";
        package.UpdateInvoicePdfUrl(pdfUrl);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var response = new PackageResponse(
            package.Id,
            package.TrackingUsa,
            package.WarehouseReceiptNumber,
            package.PackageType,
            package.CustomerId,
            package.Customer.Name,
            package.Customer.LockerCode,
            package.Description,
            package.WeightKg,
            package.DeclaredValueUsd,
            package.InvoiceNumber,
            package.CustomsDni,
            package.CustomsConsigneeName,
            package.MasterImporterCustomerId,
            package.InvoicePdfUrl,
            package.CurrentLocation.ToString(),
            package.Status.ToString(),
            package.DeliveryMethod.ToString(),
            package.DeliveryStatus.ToString(),
            package.CustomsCategory.ToString(),
            package.ReceivedMiamiAt,
            package.ArrivedTingoMariaAt,
            package.TransferredLinceAt,
            package.DeliveredAt
        );

        return Ok(response);
    }

    [HttpPost("mark-arrived-tingo-maria/{packageId}")]
    public async Task<IActionResult> MarkArrivedTingoMaria(Guid packageId, CancellationToken cancellationToken)
    {
        var package = await packageRepository.GetByIdAsync(packageId, cancellationToken)
            ?? throw new NotFoundException("Package", packageId);

        package.MarkArrivedAtTingoMaria();
        packageRepository.Update(package);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Ok(new { message = $"Paquete '{package.TrackingUsa}' registrado como ARRIBADO a Almacén Tib Courier en Tingo María (Cercado de Lima)." });
    }

    [HttpPost("transfer-to-lince")]
    public async Task<IActionResult> TransferToLince([FromBody] TransferToLinceRequest request, CancellationToken cancellationToken)
    {
        int transferredCount = await transferPackageToLinceUseCase.ExecuteAsync(request, cancellationToken);
        return Ok(new { message = $"Se trasladaron exitosamente {transferredCount} paquetes desde Tingo María al Almacén Amex en Lince." });
    }
}
