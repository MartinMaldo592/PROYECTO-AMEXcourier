using MiniERP.Domain.Common;

namespace MiniERP.Domain.Entities.Courier;

public class PackageTrackingLog : BaseEntity
{
    public Guid PackageId { get; private set; }
    public string Location { get; private set; } = null!;       // Miami, Tingo María, Lince, En Tránsito, Entregado
    public string EventDescription { get; private set; } = null!; // Descripción del evento registrado
    public string? OperatorUsername { get; private set; }        // Usuario operario que realizó la acción
    public DateTime Timestamp { get; private set; }

    public virtual Package Package { get; private set; } = null!;

    private PackageTrackingLog() { }

    public PackageTrackingLog(Guid packageId, string location, string eventDescription, string? operatorUsername = null)
    {
        PackageId = packageId;
        Location = location.Trim();
        EventDescription = eventDescription.Trim();
        OperatorUsername = operatorUsername?.Trim() ?? "Sistema AMEX";
        Timestamp = DateTime.UtcNow;
    }
}
