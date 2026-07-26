using Microsoft.EntityFrameworkCore;
using MiniERP.Application.Common.Interfaces;
using MiniERP.Domain.Entities.SD;

namespace MiniERP.Infrastructure.Persistence.Repositories;

public class CustomerRepository(ApplicationDbContext context) : ICustomerRepository
{
    public async Task<Customer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await context.Customers.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<Customer?> GetByLockerCodeAsync(string lockerCode, CancellationToken cancellationToken = default)
        => await context.Customers.FirstOrDefaultAsync(x => x.LockerCode == lockerCode.Trim().ToUpperInvariant(), cancellationToken);

    public async Task<List<Customer>> GetAllAsync(CancellationToken cancellationToken = default)
        => await context.Customers.AsNoTracking().ToListAsync(cancellationToken);

    public async Task AddAsync(Customer customer, CancellationToken cancellationToken = default)
        => await context.Customers.AddAsync(customer, cancellationToken);
}
