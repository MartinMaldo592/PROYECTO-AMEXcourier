using MiniERP.Application.Common.Exceptions;
using MiniERP.Application.Common.Interfaces;
using MiniERP.Application.DTOs;
using MiniERP.Domain.Entities.Courier;
using MiniERP.Domain.Entities.SD;

namespace MiniERP.Application.UseCases.Courier;

public class ReceivePackageUseCase(
    IPackageRepository packageRepository,
    ICustomerRepository customerRepository,
    IUnitOfWork unitOfWork)
{
    public async Task<PackageResponse> ExecuteAsync(ReceivePackageRequest request, CancellationToken cancellationToken = default)
    {
        var customer = await customerRepository.GetByLockerCodeAsync(request.LockerCode, cancellationToken)
            ?? throw new NotFoundException(nameof(Customer), request.LockerCode);

        if (!customer.IsActive)
            throw new ValidationException($"El casillero '{customer.LockerCode}' pertenece a un cliente inactivo.");

        var existingPackage = await packageRepository.GetByTrackingUsaAsync(request.TrackingUsa, cancellationToken);
        if (existingPackage != null)
            throw new ValidationException($"El paquete con Tracking USA '{request.TrackingUsa}' ya se encuentra registrado en el almacén de Miami.");

        var package = new Package(
            request.TrackingUsa,
            customer.Id,
            request.Description,
            request.WeightKg,
            request.DeclaredValueUsd,
            request.InvoiceNumber,
            request.CustomsDni,
            request.CustomsConsigneeName,
            request.MasterImporterCustomerId,
            request.InvoicePdfUrl,
            request.WarehouseReceiptNumber,
            request.PackageType
        );

        await packageRepository.AddAsync(package, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new PackageResponse(
            package.Id,
            package.TrackingUsa,
            package.WarehouseReceiptNumber,
            package.PackageType,
            customer.Id,
            customer.Name,
            customer.LockerCode,
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
    }
}
