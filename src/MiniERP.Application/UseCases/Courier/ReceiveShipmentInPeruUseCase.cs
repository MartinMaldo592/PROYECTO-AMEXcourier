using MiniERP.Application.Common.Interfaces;
using MiniERP.Domain.Exceptions;

namespace MiniERP.Application.UseCases.Courier;

public class ReceiveShipmentInPeruUseCase(
    IShipmentRepository shipmentRepository,
    IUnitOfWork unitOfWork)
{
    public async Task ExecuteAsync(Guid shipmentId, CancellationToken cancellationToken = default)
    {
        var shipment = await shipmentRepository.GetByIdAsync(shipmentId, cancellationToken)
            ?? throw new DomainException("Guía Máster no encontrada.");

        shipment.MarkReceivedInPeru();

        foreach (var pkg in shipment.Packages)
        {
            pkg.AddTrackingLog(
                "Tib Courier Tingo María",
                $"Arribo a Perú confirmado bajo Guía Máster AMEX '{shipment.MasterGuideCode}'"
            );
        }

        shipmentRepository.Update(shipment);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
