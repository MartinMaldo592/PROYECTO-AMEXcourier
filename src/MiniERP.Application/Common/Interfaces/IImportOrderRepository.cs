using MiniERP.Domain.Entities.Courier;

namespace MiniERP.Application.Common.Interfaces;

public interface IImportOrderRepository
{
    Task<ImportOrder?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ImportOrder?> GetByPackageIdAsync(Guid packageId, CancellationToken cancellationToken = default);
    Task<List<ImportOrder>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(ImportOrder order, CancellationToken cancellationToken = default);
    void Update(ImportOrder order);
}
