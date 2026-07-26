using MiniERP.Domain.Common;
using MiniERP.Domain.Entities.SD;
using MiniERP.Domain.Enums;
using MiniERP.Domain.Exceptions;

namespace MiniERP.Domain.Entities.Courier;

public class Package : BaseEntity
{
    public string TrackingUsa { get; private set; } = null!;
    public string WarehouseReceiptNumber { get; private set; } = null!; // WR# de Tib Courier (ej: WR000434345)
    public string PackageType { get; private set; } = "CAJA";             // CAJA, SOBRE, BOLSA, PALLET
    public Guid CustomerId { get; private set; }
    public string Description { get; private set; } = null!;
    public decimal WeightKg { get; private set; }
    public decimal DeclaredValueUsd { get; private set; }
    public WarehouseLocation CurrentLocation { get; private set; }
    public PackageStatus Status { get; private set; }
    public CustomsCategory CustomsCategory { get; private set; }

    // Logística Last-Mile: Carro Amex vs Recojo Lince vs Agencia
    public DeliveryMethod DeliveryMethod { get; private set; }
    public DeliveryStatus DeliveryStatus { get; private set; }

    public DateTime ReceivedMiamiAt { get; private set; }
    public DateTime? ArrivedTingoMariaAt { get; private set; }
    public DateTime? TransferredLinceAt { get; private set; }
    public DateTime? DeliveredAt { get; private set; }

    // Fraccionamiento Comercial Multi-DNI, Facturación & Adjunto PDF
    public string InvoiceNumber { get; private set; } = null!;       // Número de Invoice / Factura USA (ej: INV-8891)
    public string CustomsDni { get; private set; } = null!;          // DNI/RUC del Consignatario Titular para SUNAT
    public string CustomsConsigneeName { get; private set; } = null!; // Nombre del Titular del DNI
    public Guid? MasterImporterCustomerId { get; private set; }      // ID del Importador Comercial Principal que paga la carga
    public string? InvoicePdfUrl { get; private set; }              // Archivo PDF / Imagen de la Invoice de compra USA
    // Guía Máster AMEX (Shipment AMX0000001269)
    public Guid? ShipmentId { get; private set; }
    public virtual Shipment? Shipment { get; private set; }

    public virtual Customer Customer { get; private set; } = null!;

    private readonly List<PackageTrackingLog> _trackingLogs = new();
    public virtual IReadOnlyCollection<PackageTrackingLog> TrackingLogs => _trackingLogs.AsReadOnly();

    private Package() { }

    public Package(
        string trackingUsa,
        Guid customerId,
        string description,
        decimal weightKg,
        decimal declaredValueUsd,
        string? invoiceNumber = null,
        string? customsDni = null,
        string? customsConsigneeName = null,
        Guid? masterImporterCustomerId = null,
        string? invoicePdfUrl = null,
        string? warehouseReceiptNumber = null,
        string? packageType = null)
    {
        if (string.IsNullOrWhiteSpace(trackingUsa)) throw new DomainException("El tracking de USA es obligatorio.");
        if (string.IsNullOrWhiteSpace(description)) throw new DomainException("La descripción del contenido es obligatoria.");
        if (weightKg <= 0) throw new DomainException("El peso debe ser mayor a 0 Kg.");

        TrackingUsa = trackingUsa.Trim().ToUpperInvariant();
        CustomerId = customerId;
        Description = description.Trim();
        WeightKg = weightKg;
        DeclaredValueUsd = declaredValueUsd;

        WarehouseReceiptNumber = string.IsNullOrWhiteSpace(warehouseReceiptNumber) 
            ? $"WR000{DateTime.UtcNow.Ticks.ToString()[^6..]}" 
            : warehouseReceiptNumber.Trim().ToUpperInvariant();

        PackageType = string.IsNullOrWhiteSpace(packageType) ? "CAJA" : packageType.Trim().ToUpperInvariant();
        InvoiceNumber = string.IsNullOrWhiteSpace(invoiceNumber) ? $"INV-{DateTime.UtcNow.Ticks.ToString()[^6..]}" : invoiceNumber.Trim().ToUpperInvariant();
        CustomsDni = string.IsNullOrWhiteSpace(customsDni) ? "" : customsDni.Trim();
        CustomsConsigneeName = string.IsNullOrWhiteSpace(customsConsigneeName) ? "" : customsConsigneeName.Trim();
        MasterImporterCustomerId = masterImporterCustomerId;
        InvoicePdfUrl = invoicePdfUrl;

        CurrentLocation = WarehouseLocation.TibCourierMiami;
        Status = PackageStatus.ReceivedAtMiami;
        ReceivedMiamiAt = DateTime.UtcNow;

        DeliveryMethod = DeliveryMethod.LincePickup;
        DeliveryStatus = DeliveryStatus.PendingInWarehouse;

        CustomsCategory = declaredValueUsd <= 200 
            ? CustomsCategory.CategoryB_Under200 
            : CustomsCategory.CategoryC_Over200;
    }

    public void UpdateInvoicePdfUrl(string invoicePdfUrl)
    {
        InvoicePdfUrl = invoicePdfUrl;
    }

    public void UpdateCustomsAssignee(string invoiceNumber, string customsDni, string customsConsigneeName, Guid? masterImporterCustomerId)
    {
        InvoiceNumber = invoiceNumber.Trim().ToUpperInvariant();
        CustomsDni = customsDni.Trim();
        CustomsConsigneeName = customsConsigneeName.Trim();
        MasterImporterCustomerId = masterImporterCustomerId;
    }

    public void MarkArrivedAtTingoMaria()
    {
        CurrentLocation = WarehouseLocation.TibCourierTingoMaria;
        Status = PackageStatus.ArrivedAtTingoMaria;
        ArrivedTingoMariaAt = DateTime.UtcNow;
    }

    public void TransferToAmexLince()
    {
        if (CurrentLocation != WarehouseLocation.TibCourierTingoMaria)
            throw new DomainException($"El paquete '{TrackingUsa}' no se encuentra en el almacén de Tingo María para ser trasladado.");

        CurrentLocation = WarehouseLocation.AmexLince;
        Status = PackageStatus.TransferredToAmexLince;
        TransferredLinceAt = DateTime.UtcNow;
    }

    public void SetDeliveryMethod(DeliveryMethod method)
    {
        DeliveryMethod = method;
    }

    public void MarkInTransitAmexVehicle()
    {
        DeliveryMethod = DeliveryMethod.AmexVehicleDelivery;
        DeliveryStatus = DeliveryStatus.InTransitAmexVehicle;
    }

    public void MarkDeliveredAtHome()
    {
        DeliveryMethod = DeliveryMethod.AmexVehicleDelivery;
        DeliveryStatus = DeliveryStatus.DeliveredAtHome;
        CurrentLocation = WarehouseLocation.Delivered;
        Status = PackageStatus.Delivered;
        DeliveredAt = DateTime.UtcNow;
    }

    public void MarkPickedUpAtWarehouse()
    {
        DeliveryMethod = DeliveryMethod.LincePickup;
        DeliveryStatus = DeliveryStatus.PickedUpAtWarehouse;
        CurrentLocation = WarehouseLocation.Delivered;
        Status = PackageStatus.Delivered;
        DeliveredAt = DateTime.UtcNow;
    }

    public void MarkDispatchedToAgency()
    {
        DeliveryMethod = DeliveryMethod.NationalAgency;
        DeliveryStatus = DeliveryStatus.DispatchedToAgency;
        CurrentLocation = WarehouseLocation.Delivered;
        Status = PackageStatus.Delivered;
        DeliveredAt = DateTime.UtcNow;
    }

    public void MarkReadyForPayment()
    {
        Status = PackageStatus.ReadyForPaymentAndDelivery;
    }

    public void MarkDelivered()
    {
        CurrentLocation = WarehouseLocation.Delivered;
        Status = PackageStatus.Delivered;
        DeliveredAt = DateTime.UtcNow;
    }

    public void AssignToShipment(Guid shipmentId)
    {
        ShipmentId = shipmentId;
    }

    public void RemoveFromShipment()
    {
        ShipmentId = null;
    }

    public void AddTrackingLog(string location, string eventDescription, string? operatorUsername = null)
    {
        _trackingLogs.Add(new PackageTrackingLog(Id, location, eventDescription, operatorUsername));
    }
}
