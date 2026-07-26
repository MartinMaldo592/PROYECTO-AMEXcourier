using Microsoft.EntityFrameworkCore;
using MiniERP.Domain.Entities.Courier;
using MiniERP.Domain.Entities.SD;
using MiniERP.Domain.Entities.System;
using MiniERP.Infrastructure.Persistence.Interceptors;

namespace MiniERP.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Package> Packages => Set<Package>();
    public DbSet<ImportOrder> ImportOrders => Set<ImportOrder>();
    public DbSet<Shipment> Shipments => Set<Shipment>();
    public DbSet<PackageTrackingLog> PackageTrackingLogs => Set<PackageTrackingLog>();
    public DbSet<User> Users => Set<User>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.AddInterceptors(new AuditEntityInterceptor());
        base.OnConfiguring(optionsBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
