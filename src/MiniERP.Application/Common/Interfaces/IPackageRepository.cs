using MiniERP.Domain.Entities.Courier;

namespace MiniERP.Application.Common.Interfaces;

public interface IPackageRepository
{
    Task<Package?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Package?> GetByTrackingUsaAsync(string trackingUsa, CancellationToken cancellationToken = default);
    Task<List<Package>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
    Task<List<Package>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Package package, CancellationToken cancellationToken = default);
    void Update(Package package);
}
