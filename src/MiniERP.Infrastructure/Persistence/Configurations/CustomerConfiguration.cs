using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MiniERP.Domain.Entities.SD;

namespace MiniERP.Infrastructure.Persistence.Configurations;

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TaxId).HasMaxLength(20).IsRequired();
        builder.HasIndex(x => x.TaxId).IsUnique();
        builder.Property(x => x.LockerCode).HasMaxLength(20).IsRequired();
        builder.HasIndex(x => x.LockerCode).IsUnique();
        builder.Property(x => x.Name).HasMaxLength(150).IsRequired();
        builder.Property(x => x.Email).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Phone).HasMaxLength(30);
        builder.Property(x => x.DeliveryAddress).HasMaxLength(250);

        builder.Property(x => x.Department).HasMaxLength(80);
        builder.Property(x => x.Province).HasMaxLength(80);
        builder.Property(x => x.District).HasMaxLength(80);
        builder.Property(x => x.PreferredCarrier).HasMaxLength(80);
        builder.Property(x => x.DestinationAgency).HasMaxLength(200);

        builder.Property(x => x.DniFrontUrl).HasMaxLength(500);
        builder.Property(x => x.DniBackUrl).HasMaxLength(500);

        builder.HasQueryFilter(x => !x.IsDeleted);
    }
}
