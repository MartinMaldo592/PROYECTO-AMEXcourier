using MiniERP.Application.Common.Interfaces;
using MiniERP.Application.DTOs;
using MiniERP.Domain.Entities.Courier;

namespace MiniERP.Application.UseCases.Courier;

public class CreateShipmentUseCase(
    IShipmentRepository shipmentRepository,
    IPackageRepository packageRepository,
    IUnitOfWork unitOfWork)
{
    public async Task<ShipmentDto> ExecuteAsync(CreateShipmentRequest request, CancellationToken cancellationToken = default)
    {
        var shipment = new Shipment(
            request.MasterGuideCode,
            request.PartnerRefNumber,
            request.OriginWarehouse,
            request.DestinationWarehouse,
            request.Notes
        );

        if (request.PackageIds != null && request.PackageIds.Count > 0)
        {
            foreach (var pkgId in request.PackageIds)
            {
                var pkg = await packageRepository.GetByIdAsync(pkgId, cancellationToken);
                if (pkg != null)
                {
                    shipment.AddPackage(pkg);
                    pkg.AddTrackingLog(
                        "Tib Courier Miami",
                        $"Asignado a Guía Máster AMEX '{shipment.MasterGuideCode}'"
                    );
                }
            }
        }

        await shipmentRepository.AddAsync(shipment, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(shipment);
    }

    private static ShipmentDto MapToDto(Shipment s)
    {
        return new ShipmentDto(
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
    }
}
