using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MiniERP.Domain.Entities.Courier;

namespace MiniERP.Infrastructure.Persistence.Configurations;

public class PackageConfiguration : IEntityTypeConfiguration<Package>
{
    public void Configure(EntityTypeBuilder<Package> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TrackingUsa).HasMaxLength(100).IsRequired();
        builder.HasIndex(x => x.TrackingUsa).IsUnique();
        builder.Property(x => x.WarehouseReceiptNumber).HasMaxLength(50).IsRequired();
        builder.Property(x => x.PackageType).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(250).IsRequired();
        builder.Property(x => x.WeightKg).HasPrecision(18, 2).IsRequired();
        builder.Property(x => x.DeclaredValueUsd).HasPrecision(18, 2).IsRequired();

        builder.Property(x => x.InvoiceNumber).HasMaxLength(100);
        builder.Property(x => x.CustomsDni).HasMaxLength(30);
        builder.Property(x => x.CustomsConsigneeName).HasMaxLength(150);
        builder.Property(x => x.InvoicePdfUrl).HasMaxLength(500);

        builder.Property(x => x.DeliveryMethod).HasConversion<int>().IsRequired();
        builder.Property(x => x.DeliveryStatus).HasConversion<int>().IsRequired();

        builder.HasOne(x => x.Customer)
               .WithMany()
               .HasForeignKey(x => x.CustomerId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
