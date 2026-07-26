using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MiniERP.Domain.Entities.Courier;

namespace MiniERP.Infrastructure.Persistence.Configurations;

public class PackageTrackingLogConfiguration : IEntityTypeConfiguration<PackageTrackingLog>
{
    public void Configure(EntityTypeBuilder<PackageTrackingLog> builder)
    {
        builder.HasKey(l => l.Id);

        builder.Property(l => l.Location)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(l => l.EventDescription)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(l => l.OperatorUsername)
            .HasMaxLength(100);

        builder.HasOne(l => l.Package)
            .WithMany(p => p.TrackingLogs)
            .HasForeignKey(l => l.PackageId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(l => !l.IsDeleted);
    }
}
