using MiniERP.Domain.Common;
using MiniERP.Domain.Exceptions;

namespace MiniERP.Domain.Entities.SD;

public class Customer : BaseEntity
{
    public string TaxId { get; private set; } = null!; // RUC o DNI
    public string Name { get; private set; } = null!;
    public string Email { get; private set; } = null!;
    public string LockerCode { get; private set; } = null!; // Ej: AMEX-PER-1042
    public string Phone { get; private set; } = null!;
    public string DeliveryAddress { get; private set; } = null!; // Dirección en Perú

    // Ubigeo y Agencia de Despacho Nacional (Shalom, Olva, Cruz del Sur, etc.)
    public string Department { get; private set; } = null!; 
    public string Province { get; private set; } = null!;   
    public string District { get; private set; } = null!;   
    public string PreferredCarrier { get; private set; } = null!; 
    public string DestinationAgency { get; private set; } = null!; 

    // Almacenamiento Digital de DNI (Fotos Anverso y Reverso)
    public string? DniFrontUrl { get; private set; }
    public string? DniBackUrl { get; private set; }

    public bool IsActive { get; private set; } = true;

    private Customer() { }

    public Customer(
        string taxId,
        string name,
        string email,
        string lockerCode,
        string phone,
        string deliveryAddress,
        string department,
        string province,
        string district,
        string preferredCarrier,
        string destinationAgency,
        string? dniFrontUrl = null,
        string? dniBackUrl = null)
    {
        if (string.IsNullOrWhiteSpace(taxId)) throw new DomainException("El RUC/DNI es obligatorio.");
        if (string.IsNullOrWhiteSpace(name)) throw new DomainException("El nombre del cliente es obligatorio.");
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@')) throw new DomainException("Email no válido.");
        if (string.IsNullOrWhiteSpace(lockerCode)) throw new DomainException("El código de casillero es obligatorio.");

        TaxId = taxId.Trim();
        Name = name.Trim();
        Email = email.Trim().ToLowerInvariant();
        LockerCode = lockerCode.Trim().ToUpperInvariant();
        Phone = phone.Trim();
        DeliveryAddress = deliveryAddress.Trim();
        Department = string.IsNullOrWhiteSpace(department) ? "LIMA" : department.Trim().ToUpperInvariant();
        Province = string.IsNullOrWhiteSpace(province) ? "LIMA" : province.Trim().ToUpperInvariant();
        District = string.IsNullOrWhiteSpace(district) ? "LINCE" : district.Trim().ToUpperInvariant();
        PreferredCarrier = string.IsNullOrWhiteSpace(preferredCarrier) ? "SHALOM" : preferredCarrier.Trim().ToUpperInvariant();
        DestinationAgency = string.IsNullOrWhiteSpace(destinationAgency) ? "ENTREGA EN ALMACEN LINCE" : destinationAgency.Trim().ToUpperInvariant();
        DniFrontUrl = dniFrontUrl;
        DniBackUrl = dniBackUrl;
        IsActive = true;
    }

    public void UpdateDniUrls(string frontUrl, string backUrl)
    {
        DniFrontUrl = frontUrl;
        DniBackUrl = backUrl;
    }

    public void Deactivate() => IsActive = false;
    public void Activate() => IsActive = true;
}
