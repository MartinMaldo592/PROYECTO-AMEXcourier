using MiniERP.Application.Common.Exceptions;
using MiniERP.Application.Common.Interfaces;
using MiniERP.Application.DTOs;
using MiniERP.Domain.Entities.Courier;
using MiniERP.Domain.Entities.SD;

namespace MiniERP.Application.UseCases.Courier;

public class LiquidateImportOrderUseCase(
    IPackageRepository packageRepository,
    IImportOrderRepository importOrderRepository,
    ICustomerRepository customerRepository,
    IUnitOfWork unitOfWork)
{
    public async Task<AmexImportOrderResponse> ExecuteAsync(LiquidateAmexOrderRequest request, CancellationToken cancellationToken = default)
    {
        var package = await packageRepository.GetByIdAsync(request.PackageId, cancellationToken)
            ?? throw new NotFoundException(nameof(Package), request.PackageId);

        var existingOrder = await importOrderRepository.GetByPackageIdAsync(request.PackageId, cancellationToken);
        if (existingOrder != null)
            throw new ValidationException($"El paquete '{package.TrackingUsa}' ({package.WarehouseReceiptNumber}) ya tiene una liquidación de flete generada.");

        var customer = await customerRepository.GetByIdAsync(package.CustomerId, cancellationToken)
            ?? throw new NotFoundException(nameof(Customer), package.CustomerId);

        var order = new ImportOrder(
            package.CustomerId,
            package.Id,
            package.WeightKg,
            package.DeclaredValueUsd,
            request.AmexFreightRatePerKg,
            request.AmexAdminFeeUsd,
            request.TibRatePerKg,
            request.ExchangeRate
        );

        if (!string.IsNullOrWhiteSpace(request.PaymentMethod))
        {
            order.RegisterPayment(
                request.PaymentCurrency ?? "PEN",
                request.PaymentMethod,
                request.PaymentReference ?? "COBRO_LINCE",
                request.PaymentCurrency == "USD" ? order.TotalAmountUsd : order.TotalAmountPen,
                request.PaymentProofUrl
            );
            package.MarkReadyForPayment();
        }

        await importOrderRepository.AddAsync(order, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new AmexImportOrderResponse(
            order.Id,
            customer.Id,
            customer.Name,
            customer.LockerCode,
            package.Id,
            package.TrackingUsa,
            package.WarehouseReceiptNumber,
            order.WeightKg,
            order.FreightCostUsd,
            order.AmexAdminFeeUsd,
            order.TotalTaxesUsd,
            order.TotalAmountUsd,
            order.TotalAmountPen,
            order.TibTotalCostUsd,
            order.AmexNetProfitUsd,
            order.ExchangeRate,
            order.IsPaid,
            order.PaymentCurrency,
            order.PaymentMethod,
            order.PaymentReference,
            order.PaymentProofUrl,
            order.PaidAmount,
            order.PaidAt,
            order.OrderDate
        );
    }
}
