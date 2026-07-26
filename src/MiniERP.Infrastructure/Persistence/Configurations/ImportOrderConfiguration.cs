using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MiniERP.Domain.Entities.Courier;

namespace MiniERP.Infrastructure.Persistence.Configurations;

public class ImportOrderConfiguration : IEntityTypeConfiguration<ImportOrder>
{
    public void Configure(EntityTypeBuilder<ImportOrder> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.WeightKg).HasPrecision(18, 2).IsRequired();
        builder.Property(x => x.AmexFreightRatePerKg).HasPrecision(18, 2).IsRequired();
        builder.Property(x => x.FreightCostUsd).HasPrecision(18, 2).IsRequired();
        builder.Property(x => x.AmexAdminFeeUsd).HasPrecision(18, 2).IsRequired();

        builder.Property(x => x.AdValoremTaxUsd).HasPrecision(18, 2).IsRequired();
        builder.Property(x => x.IgvTaxUsd).HasPrecision(18, 2).IsRequired();
        builder.Property(x => x.TotalTaxesUsd).HasPrecision(18, 2).IsRequired();

        builder.Property(x => x.TotalAmountUsd).HasPrecision(18, 2).IsRequired();
        builder.Property(x => x.TotalAmountPen).HasPrecision(18, 2).IsRequired();
        builder.Property(x => x.ExchangeRate).HasPrecision(18, 2).IsRequired();

        builder.Property(x => x.TibRatePerKg).HasPrecision(18, 2).IsRequired();
        builder.Property(x => x.TibTotalCostUsd).HasPrecision(18, 2).IsRequired();
        builder.Property(x => x.AmexNetProfitUsd).HasPrecision(18, 2).IsRequired();

        builder.Property(x => x.PaymentCurrency).HasMaxLength(10);
        builder.Property(x => x.PaymentMethod).HasMaxLength(50);
        builder.Property(x => x.PaymentReference).HasMaxLength(100);
        builder.Property(x => x.PaymentProofUrl).HasMaxLength(500);
        builder.Property(x => x.PaidAmount).HasPrecision(18, 2);

        builder.HasOne(x => x.Customer)
               .WithMany()
               .HasForeignKey(x => x.CustomerId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Package)
               .WithMany()
               .HasForeignKey(x => x.PackageId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
