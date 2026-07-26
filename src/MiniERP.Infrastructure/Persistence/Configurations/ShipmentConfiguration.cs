using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MiniERP.Domain.Entities.Courier;

namespace MiniERP.Infrastructure.Persistence.Configurations;

public class ShipmentConfiguration : IEntityTypeConfiguration<Shipment>
{
    public void Configure(EntityTypeBuilder<Shipment> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.MasterGuideCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(s => s.MasterGuideCode)
            .IsUnique();

        builder.Property(s => s.PartnerRefNumber)
            .HasMaxLength(100);

        builder.Property(s => s.OriginWarehouse)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.DestinationWarehouse)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasMany(s => s.Packages)
            .WithOne(p => p.Shipment)
            .HasForeignKey(p => p.ShipmentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasQueryFilter(s => !s.IsDeleted);
    }
}
