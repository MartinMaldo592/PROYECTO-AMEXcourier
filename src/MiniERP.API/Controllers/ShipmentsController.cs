using Microsoft.AspNetCore.Mvc;
using MiniERP.Application.Common.Interfaces;
using MiniERP.Application.DTOs;
using MiniERP.Application.UseCases.Courier;

namespace MiniERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShipmentsController(
    IShipmentRepository shipmentRepository,
    IPackageRepository packageRepository,
    CreateShipmentUseCase createShipmentUseCase,
    ReceiveShipmentInPeruUseCase receiveShipmentInPeruUseCase,
    IUnitOfWork unitOfWork) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var shipments = await shipmentRepository.GetAllAsync(cancellationToken);
        var dtos = shipments.Select(s => new ShipmentDto(
            s.Id,
            s.MasterGuideCode,
            s.PartnerRefNumber,
            s.OriginWarehouse,
            s.DestinationWarehouse,
            s.DispatchedFromMiamiAt,
            s.ReceivedInPeruAt,
            s.Status,
            s.Notes,
            s.TotalWeightKg,
            s.TotalDeclaredValueUsd,
            s.TotalPackagesCount,
            s.Packages.Select(p => new PackageSummaryDto(
                p.Id,
                p.TrackingUsa,
                p.Customer?.LockerCode ?? "",
                p.Customer?.Name ?? "",
                p.WeightKg,
                p.DeclaredValueUsd,
                p.CurrentLocation.ToString(),
                p.Status.ToString()
            )).ToList()
        ));

        return Ok(dtos);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var s = await shipmentRepository.GetByIdAsync(id, cancellationToken);
        if (s == null) return NotFound(new { message = "Guía Máster no encontrada." });

        var dto = new ShipmentDto(
            s.Id,
            s.MasterGuideCode,
            s.PartnerRefNumber,
            s.OriginWarehouse,
            s.DestinationWarehouse,
            s.DispatchedFromMiamiAt,
            s.ReceivedInPeruAt,
            s.Status,
            s.Notes,
            s.TotalWeightKg,
            s.TotalDeclaredValueUsd,
            s.TotalPackagesCount,
            s.Packages.Select(p => new PackageSummaryDto(
                p.Id,
                p.TrackingUsa,
                p.Customer?.LockerCode ?? "",
                p.Customer?.Name ?? "",
                p.WeightKg,
                p.DeclaredValueUsd,
                p.CurrentLocation.ToString(),
                p.Status.ToString()
            )).ToList()
        );

        return Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateShipmentRequest request, CancellationToken cancellationToken)
    {
        var dto = await createShipmentUseCase.ExecuteAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPost("{id:guid}/assign-packages")]
    public async Task<IActionResult> AssignPackages(Guid id, [FromBody] AssignPackagesRequest request, CancellationToken cancellationToken)
    {
        var shipment = await shipmentRepository.GetByIdAsync(id, cancellationToken);
        if (shipment == null) return NotFound(new { message = "Guía Máster no encontrada." });

        foreach (var pkgId in request.PackageIds)
        {
            var pkg = await packageRepository.GetByIdAsync(pkgId, cancellationToken);
            if (pkg != null)
            {
                shipment.AddPackage(pkg);
                pkg.AddTrackingLog("Tib Courier Miami", $"Asignado a Guía Máster AMEX '{shipment.MasterGuideCode}'");
            }
        }

        shipmentRepository.Update(shipment);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Ok(new { message = $"Se asignaron {request.PackageIds.Count} paquetes a la Guía Máster {shipment.MasterGuideCode}." });
    }

    [HttpPost("{id:guid}/receive-peru")]
    public async Task<IActionResult> ReceiveInPeru(Guid id, CancellationToken cancellationToken)
    {
        await receiveShipmentInPeruUseCase.ExecuteAsync(id, cancellationToken);
        return Ok(new { message = "Guía Máster recibida exitosamente en Perú (Tingo María)." });
    }
}
