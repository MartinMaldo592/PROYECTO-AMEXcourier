using MiniERP.Domain.Entities.Courier;

namespace MiniERP.Application.Common.Interfaces;

public interface IShipmentRepository
{
    Task<Shipment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Shipment?> GetByMasterGuideCodeAsync(string masterGuideCode, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Shipment>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Shipment shipment, CancellationToken cancellationToken = default);
    void Update(Shipment shipment);
}
