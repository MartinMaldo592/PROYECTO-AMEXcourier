using MiniERP.Application.Common.Exceptions;
using MiniERP.Application.Common.Interfaces;
using MiniERP.Application.DTOs;
using MiniERP.Domain.Entities.Courier;

namespace MiniERP.Application.UseCases.Courier;

public class GenerateShippingLabelUseCase(
    IPackageRepository packageRepository,
    ICustomerRepository customerRepository)
{
    public async Task<ShippingLabelResponse> ExecuteAsync(Guid packageId, CancellationToken cancellationToken = default)
    {
        var package = await packageRepository.GetByIdAsync(packageId, cancellationToken)
            ?? throw new NotFoundException(nameof(Package), packageId);

        var customer = await customerRepository.GetByIdAsync(package.CustomerId, cancellationToken)
            ?? throw new NotFoundException("Customer", package.CustomerId);

        var finalConsigneeName = !string.IsNullOrWhiteSpace(package.CustomsConsigneeName) ? package.CustomsConsigneeName : customer.Name;
        var finalConsigneeTaxId = !string.IsNullOrWhiteSpace(package.CustomsDni) ? package.CustomsDni : customer.TaxId;

        return new ShippingLabelResponse(
            package.Id,
            package.TrackingUsa,
            package.WarehouseReceiptNumber,
            package.PackageType,
            customer.LockerCode,
            finalConsigneeName,
            finalConsigneeTaxId,
            customer.Phone,
            customer.Email,
            customer.Department,
            customer.Province,
            customer.District,
            customer.DeliveryAddress,
            customer.PreferredCarrier,
            customer.DestinationAgency,
            package.InvoiceNumber,
            package.CustomsDni,
            package.CustomsConsigneeName,
            package.InvoicePdfUrl,
            package.Description,
            package.WeightKg,
            package.DeliveryMethod.ToString(),
            package.DeliveryStatus.ToString(),
            SenderName: "Amex Courier S.A.C. (Sede Lince)",
            SenderAddress: "Av. Petit Thouars 1500, Lince, Lima",
            SenderPhone: "+51 912345678",
            SenderRuc: "20609998881"
        );
    }
}
