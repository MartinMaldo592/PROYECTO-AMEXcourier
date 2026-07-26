using Microsoft.EntityFrameworkCore;
using MiniERP.Application.Common.Interfaces;
using MiniERP.Domain.Entities.Courier;

namespace MiniERP.Infrastructure.Persistence.Repositories;

public class ImportOrderRepository(ApplicationDbContext context) : IImportOrderRepository
{
    public async Task<ImportOrder?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.ImportOrders
            .Include(x => x.Customer)
            .Include(x => x.Package)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<ImportOrder?> GetByPackageIdAsync(Guid packageId, CancellationToken cancellationToken = default)
    {
        return await context.ImportOrders
            .Include(x => x.Customer)
            .Include(x => x.Package)
            .FirstOrDefaultAsync(x => x.PackageId == packageId, cancellationToken);
    }

    public async Task<List<ImportOrder>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.ImportOrders
            .Include(x => x.Customer)
            .Include(x => x.Package)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(ImportOrder order, CancellationToken cancellationToken = default)
    {
        await context.ImportOrders.AddAsync(order, cancellationToken);
    }

    public void Update(ImportOrder order)
    {
        context.ImportOrders.Update(order);
    }
}
