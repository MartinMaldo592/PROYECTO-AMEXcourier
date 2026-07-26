using MiniERP.Application.Common.Exceptions;
using MiniERP.Application.Common.Interfaces;
using MiniERP.Application.DTOs;
using MiniERP.Domain.Entities.Courier;
using MiniERP.Domain.Enums;

namespace MiniERP.Application.UseCases.Courier;

public class UpdateDeliveryStatusUseCase(
    IPackageRepository packageRepository,
    IUnitOfWork unitOfWork)
{
    public async Task ExecuteAsync(UpdateDeliveryStatusRequest request, CancellationToken cancellationToken = default)
    {
        var package = await packageRepository.GetByIdAsync(request.PackageId, cancellationToken)
            ?? throw new NotFoundException(nameof(Package), request.PackageId);

        if (Enum.TryParse<DeliveryMethod>(request.DeliveryMethod, true, out var method))
        {
            package.SetDeliveryMethod(method);
        }

        if (Enum.TryParse<DeliveryStatus>(request.DeliveryStatus, true, out var status))
        {
            switch (status)
            {
                case DeliveryStatus.InTransitAmexVehicle:
                    package.MarkInTransitAmexVehicle();
                    break;
                case DeliveryStatus.DeliveredAtHome:
                    package.MarkDeliveredAtHome();
                    break;
                case DeliveryStatus.PickedUpAtWarehouse:
                    package.MarkPickedUpAtWarehouse();
                    break;
                case DeliveryStatus.DispatchedToAgency:
                    package.MarkDispatchedToAgency();
                    break;
            }
        }

        packageRepository.Update(package);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
