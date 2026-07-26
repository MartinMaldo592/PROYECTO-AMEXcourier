using MiniERP.Domain.Common;
using MiniERP.Domain.Enums;
using MiniERP.Domain.Exceptions;

namespace MiniERP.Domain.Entities.Courier;

public class Shipment : BaseEntity
{
    public string MasterGuideCode { get; private set; } = null!; // ej: AMX0000001269
    public string? PartnerRefNumber { get; private set; }       // ej: WR-TIB-8821
    public string OriginWarehouse { get; private set; } = "Tib Courier Miami";
    public string DestinationWarehouse { get; private set; } = "Amex Lince / Tingo María";
    public DateTime DispatchedFromMiamiAt { get; private set; }
    public DateTime? ReceivedInPeruAt { get; private set; }
    public string Status { get; private set; } = "EN_TRANSITO"; // EN_TRANSITO, RECIBIDO_PERU, CERRADO
    public string? Notes { get; private set; }

    private readonly List<Package> _packages = new();
    public virtual IReadOnlyCollection<Package> Packages => _packages.AsReadOnly();

    public decimal TotalWeightKg => _packages.Sum(p => p.WeightKg);
    public decimal TotalDeclaredValueUsd => _packages.Sum(p => p.DeclaredValueUsd);
    public int TotalPackagesCount => _packages.Count;

    private Shipment() { }

    public Shipment(
        string? masterGuideCode = null,
        string? partnerRefNumber = null,
        string? originWarehouse = null,
        string? destinationWarehouse = null,
        string? notes = null)
    {
        MasterGuideCode = string.IsNullOrWhiteSpace(masterGuideCode)
            ? $"AMX000{DateTime.UtcNow.Ticks.ToString()[^7..]}"
            : masterGuideCode.Trim().ToUpperInvariant();

        PartnerRefNumber = partnerRefNumber?.Trim();
        OriginWarehouse = string.IsNullOrWhiteSpace(originWarehouse) ? "Tib Courier Miami" : originWarehouse.Trim();
        DestinationWarehouse = string.IsNullOrWhiteSpace(destinationWarehouse) ? "Amex Lince / Tingo María" : destinationWarehouse.Trim();
        DispatchedFromMiamiAt = DateTime.UtcNow;
        Status = "EN_TRANSITO";
        Notes = notes?.Trim();
    }

    public void UpdateInfo(string partnerRefNumber, string notes)
    {
        PartnerRefNumber = partnerRefNumber.Trim();
        Notes = notes.Trim();
    }

    public void AddPackage(Package package)
    {
        if (Status == "CERRADO")
            throw new DomainException($"La Guía Máster '{MasterGuideCode}' se encuentra cerrada.");

        if (!_packages.Any(p => p.Id == package.Id))
        {
            _packages.Add(package);
            package.AssignToShipment(Id);
        }
    }

    public void RemovePackage(Guid packageId)
    {
        var pkg = _packages.FirstOrDefault(p => p.Id == packageId);
        if (pkg != null)
        {
            _packages.Remove(pkg);
            pkg.RemoveFromShipment();
        }
    }

    public void MarkReceivedInPeru()
    {
        if (Status == "RECIBIDO_PERU" || Status == "CERRADO")
            return;

        Status = "RECIBIDO_PERU";
        ReceivedInPeruAt = DateTime.UtcNow;

        foreach (var pkg in _packages)
        {
            if (pkg.CurrentLocation == WarehouseLocation.TibCourierMiami)
            {
                pkg.MarkArrivedAtTingoMaria();
            }
        }
    }

    public void CloseShipment()
    {
        Status = "CERRADO";
    }
}
