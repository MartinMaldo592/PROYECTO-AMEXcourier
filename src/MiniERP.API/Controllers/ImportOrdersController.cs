using Microsoft.AspNetCore.Mvc;
using MiniERP.Application.Common.Exceptions;
using MiniERP.Application.Common.Interfaces;
using MiniERP.Application.DTOs;
using MiniERP.Application.UseCases.Courier;

namespace MiniERP.API.Controllers;

[ApiController]
[Route("api/v1/import-orders")]
public class ImportOrdersController(
    LiquidateImportOrderUseCase liquidateImportOrderUseCase,
    IImportOrderRepository importOrderRepository,
    IUnitOfWork unitOfWork) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<AmexImportOrderResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var orders = await importOrderRepository.GetAllAsync(cancellationToken);
        var result = orders.Select(o => new AmexImportOrderResponse(
            o.Id,
            o.CustomerId,
            o.Customer.Name,
            o.Customer.LockerCode,
            o.PackageId,
            o.Package.TrackingUsa,
            o.Package.WarehouseReceiptNumber,
            o.WeightKg,
            o.FreightCostUsd,
            o.AmexAdminFeeUsd,
            o.TotalTaxesUsd,
            o.TotalAmountUsd,
            o.TotalAmountPen,
            o.TibTotalCostUsd,
            o.AmexNetProfitUsd,
            o.ExchangeRate,
            o.IsPaid,
            o.PaymentCurrency,
            o.PaymentMethod,
            o.PaymentReference,
            o.PaymentProofUrl,
            o.PaidAmount,
            o.PaidAt,
            o.OrderDate
        )).ToList();

        return Ok(result);
    }

    [HttpPost("liquidate")]
    public async Task<ActionResult<AmexImportOrderResponse>> LiquidateOrder([FromBody] LiquidateAmexOrderRequest request, CancellationToken cancellationToken)
    {
        var response = await liquidateImportOrderUseCase.ExecuteAsync(request, cancellationToken);
        return Ok(response);
    }

    [HttpPost("{orderId}/register-payment")]
    public async Task<ActionResult<AmexImportOrderResponse>> RegisterPayment(
        Guid orderId,
        [FromBody] RegisterPaymentRequest request,
        CancellationToken cancellationToken)
    {

        var order = await importOrderRepository.GetByIdAsync(orderId, cancellationToken)
            ?? throw new NotFoundException("ImportOrder", orderId);

        order.RegisterPayment(
            request.PaymentCurrency,
            request.PaymentMethod,
            request.PaymentReference,
            request.PaidAmount,
            request.PaymentProofUrl
        );

        importOrderRepository.Update(order);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var response = new AmexImportOrderResponse(
            order.Id,
            order.CustomerId,
            order.Customer.Name,
            order.Customer.LockerCode,
            order.PackageId,
            order.Package.TrackingUsa,
            order.Package.WarehouseReceiptNumber,
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

        return Ok(response);
    }
}
