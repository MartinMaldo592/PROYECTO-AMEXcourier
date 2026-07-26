namespace MiniERP.Application.DTOs;

public class CreateCustomerCourierRequest
{
    public string TaxId { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string DeliveryAddress { get; set; } = null!;
    public string Department { get; set; } = null!;
    public string Province { get; set; } = null!;
    public string District { get; set; } = null!;
    public string PreferredCarrier { get; set; } = null!;
    public string DestinationAgency { get; set; } = null!;
}

public record CustomerCourierResponse(
    Guid Id,
    string TaxId,
    string Name,
    string Email,
    string LockerCode,
    string Phone,
    string DeliveryAddress,
    string Department,
    string Province,
    string District,
    string PreferredCarrier,
    string DestinationAgency,
    string? DniFrontUrl,
    string? DniBackUrl,
    bool IsActive,
    DateTime CreatedAt
);

public class ReceivePackageRequest
{
    public string TrackingUsa { get; set; } = null!;
    public string LockerCode { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal WeightKg { get; set; }
    public decimal DeclaredValueUsd { get; set; }
    public string? InvoiceNumber { get; set; }
    public string? CustomsDni { get; set; }
    public string? CustomsConsigneeName { get; set; }
    public Guid? MasterImporterCustomerId { get; set; }
    public string? InvoicePdfUrl { get; set; }
    public string? WarehouseReceiptNumber { get; set; }
    public string? PackageType { get; set; }
}

public record PackageResponse(
    Guid Id,
    string TrackingUsa,
    string WarehouseReceiptNumber,
    string PackageType,
    Guid CustomerId,
    string CustomerName,
    string LockerCode,
    string Description,
    decimal WeightKg,
    decimal DeclaredValueUsd,
    string InvoiceNumber,
    string CustomsDni,
    string CustomsConsigneeName,
    Guid? MasterImporterCustomerId,
    string? InvoicePdfUrl,
    string CurrentLocation,
    string Status,
    string DeliveryMethod,
    string DeliveryStatus,
    string CustomsCategory,
    DateTime ReceivedMiamiAt,
    DateTime? ArrivedTingoMariaAt,
    DateTime? TransferredLinceAt,
    DateTime? DeliveredAt,
    Guid? ShipmentId = null,
    string? MasterGuideCode = null
);

public record TrackingLogDto(
    Guid Id,
    Guid PackageId,
    string Location,
    string EventDescription,
    string? OperatorUsername,
    DateTime Timestamp
);

public class TransferToLinceRequest
{
    public List<Guid> PackageIds { get; set; } = new();
}

public class UpdateDeliveryStatusRequest
{
    public Guid PackageId { get; set; }
    public string DeliveryMethod { get; set; } = "LincePickup"; // LincePickup, AmexVehicleDelivery, NationalAgency
    public string DeliveryStatus { get; set; } = "PendingInWarehouse"; // PendingInWarehouse, InTransitAmexVehicle, DeliveredAtHome, PickedUpAtWarehouse, DispatchedToAgency
}

public class LiquidateAmexOrderRequest
{
    public Guid PackageId { get; set; }
    public decimal AmexFreightRatePerKg { get; set; } = 12.00m;
    public decimal AmexAdminFeeUsd { get; set; } = 5.00m;
    public decimal TibRatePerKg { get; set; } = 7.50m;
    public decimal ExchangeRate { get; set; } = 3.75m;
    public string? PaymentCurrency { get; set; } = "PEN";
    public string? PaymentMethod { get; set; } = "YAPE";
    public string? PaymentReference { get; set; }
    public string? PaymentProofUrl { get; set; }
}

public class RegisterPaymentRequest
{
    public Guid ImportOrderId { get; set; }
    public string PaymentCurrency { get; set; } = "PEN"; // PEN o USD
    public string PaymentMethod { get; set; } = "YAPE"; // YAPE, PLIN, BCP_TRANSFER, BBVA_TRANSFER, CASH, CARD
    public string PaymentReference { get; set; } = null!; // N° Operación
    public string? PaymentProofUrl { get; set; }
    public decimal PaidAmount { get; set; }
}

public record AmexImportOrderResponse(
    Guid Id,
    Guid CustomerId,
    string CustomerName,
    string LockerCode,
    Guid PackageId,
    string TrackingUsa,
    string WarehouseReceiptNumber,
    decimal WeightKg,
    decimal FreightCostUsd,
    decimal AmexAdminFeeUsd,
    decimal TotalTaxesUsd,
    decimal TotalAmountUsd,
    decimal TotalAmountPen,
    decimal TibTotalCostUsd,
    decimal AmexNetProfitUsd,
    decimal ExchangeRate,
    bool IsPaid,
    string PaymentCurrency,
    string PaymentMethod,
    string PaymentReference,
    string? PaymentProofUrl,
    decimal PaidAmount,
    DateTime? PaidAt,
    DateTime OrderDate
);

public record ShippingLabelResponse(
    Guid PackageId,
    string TrackingUsa,
    string WarehouseReceiptNumber,
    string PackageType,
    string LockerCode,
    string CustomerName,
    string CustomerTaxId,
    string CustomerPhone,
    string CustomerEmail,
    string Department,
    string Province,
    string District,
    string DeliveryAddress,
    string PreferredCarrier,
    string DestinationAgency,
    string InvoiceNumber,
    string CustomsDni,
    string CustomsConsigneeName,
    string? InvoicePdfUrl,
    string Description,
    decimal WeightKg,
    string DeliveryMethod,
    string DeliveryStatus,
    string SenderName,
    string SenderAddress,
    string SenderPhone,
    string SenderRuc
);

public record DriverVehicleRouteItem(
    Guid PackageId,
    string WarehouseReceiptNumber,
    string TrackingUsa,
    string CustomerName,
    string CustomerPhone,
    string DeliveryAddress,
    string Department,
    string Province,
    string District,
    string Description,
    decimal WeightKg,
    string InvoiceNumber,
    bool IsPaid,
    string PaymentCurrency,
    string PaymentMethod,
    decimal TotalAmountUsd,
    decimal TotalAmountPen,
    string DeliveryStatus
);
