namespace MiniERP.Application.DTOs;

public record ShipmentDto(
    Guid Id,
    string MasterGuideCode,
    string? PartnerRefNumber,
    string OriginWarehouse,
    string DestinationWarehouse,
    DateTime DispatchedFromMiamiAt,
    DateTime? ReceivedInPeruAt,
    string Status,
    string? Notes,
    decimal TotalWeightKg,
    decimal TotalDeclaredValueUsd,
    int TotalPackagesCount,
    List<PackageSummaryDto> Packages
);

public record PackageSummaryDto(
    Guid Id,
    string TrackingUsa,
    string CustomerLockerCode,
    string CustomerName,
    decimal WeightKg,
    decimal DeclaredValueUsd,
    string CurrentLocation,
    string Status
);

public record CreateShipmentRequest(
    string? MasterGuideCode,
    string? PartnerRefNumber,
    string? OriginWarehouse,
    string? DestinationWarehouse,
    string? Notes,
    List<Guid>? PackageIds
);

public record AssignPackagesRequest(
    List<Guid> PackageIds
);
