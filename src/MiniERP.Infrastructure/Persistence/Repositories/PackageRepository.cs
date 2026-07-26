using Microsoft.EntityFrameworkCore;
using MiniERP.Application.Common.Interfaces;
using MiniERP.Domain.Entities.Courier;

namespace MiniERP.Infrastructure.Persistence.Repositories;

public class PackageRepository(ApplicationDbContext context) : IPackageRepository
{
    public async Task<Package?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await context.Packages.Include(x => x.Customer).Include(x => x.Shipment).Include(x => x.TrackingLogs).FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<Package?> GetByTrackingUsaAsync(string trackingUsa, CancellationToken cancellationToken = default)
        => await context.Packages.Include(x => x.Customer).Include(x => x.Shipment).Include(x => x.TrackingLogs).FirstOrDefaultAsync(x => x.TrackingUsa == trackingUsa.ToUpperInvariant(), cancellationToken);

    public async Task<List<Package>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default)
        => await context.Packages.Where(x => x.CustomerId == customerId).Include(x => x.Shipment).ToListAsync(cancellationToken);

    public async Task<List<Package>> GetAllAsync(CancellationToken cancellationToken = default)
        => await context.Packages.Include(x => x.Customer).Include(x => x.Shipment).AsNoTracking().ToListAsync(cancellationToken);

    public async Task AddAsync(Package package, CancellationToken cancellationToken = default)
        => await context.Packages.AddAsync(package, cancellationToken);

    public void Update(Package package)
        => context.Packages.Update(package);
}
