using Microsoft.EntityFrameworkCore;
using MiniERP.Application.Common.Interfaces;
using MiniERP.Domain.Entities.Courier;

namespace MiniERP.Infrastructure.Persistence.Repositories;

public class ShipmentRepository(ApplicationDbContext context) : IShipmentRepository
{
    public async Task<Shipment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Shipments
            .Include(s => s.Packages)
                .ThenInclude(p => p.Customer)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public async Task<Shipment?> GetByMasterGuideCodeAsync(string masterGuideCode, CancellationToken cancellationToken = default)
    {
        var normCode = masterGuideCode.Trim().ToUpperInvariant();
        return await context.Shipments
            .Include(s => s.Packages)
                .ThenInclude(p => p.Customer)
            .FirstOrDefaultAsync(s => s.MasterGuideCode == normCode, cancellationToken);
    }

    public async Task<IReadOnlyList<Shipment>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await context.Shipments
            .Include(s => s.Packages)
                .ThenInclude(p => p.Customer)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Shipment shipment, CancellationToken cancellationToken = default)
    {
        await context.Shipments.AddAsync(shipment, cancellationToken);
    }

    public void Update(Shipment shipment)
    {
        context.Shipments.Update(shipment);
    }
}
