using MiniERP.Domain.Common;
using MiniERP.Domain.Entities.SD;
using MiniERP.Domain.Exceptions;

namespace MiniERP.Domain.Entities.Courier;

public class ImportOrder : BaseEntity
{
    public Guid CustomerId { get; private set; }
    public Guid PackageId { get; private set; }

    public decimal WeightKg { get; private set; }
    public decimal AmexFreightRatePerKg { get; private set; } // ej: $12.00 / Kg
    public decimal FreightCostUsd { get; private set; }        // WeightKg * AmexFreightRatePerKg
    public decimal AmexAdminFeeUsd { get; private set; }       // ej: $5.00 tarifa fija admin

    public decimal AdValoremTaxUsd { get; private set; }      // Impuesto SUNAT Ad-Valorem
    public decimal IgvTaxUsd { get; private set; }            // Impuesto SUNAT IGV
    public decimal TotalTaxesUsd { get; private set; }        // AdValorem + IGV

    public decimal TotalAmountUsd { get; private set; }       // Freight + Admin + Taxes
    public decimal TotalAmountPen { get; private set; }       // TotalAmountUsd * ExchangeRate
    public decimal ExchangeRate { get; private set; }           // Tipo de Cambio ej: 3.75

    // Costos Operativos Mayoristas (Tib Courier Partner 3PL)
    public decimal TibRatePerKg { get; private set; }          // Costo cobrado por Tib (ej: $7.50 / Kg)
    public decimal TibTotalCostUsd { get; private set; }       // (WeightKg * TibRatePerKg) + Taxes
    public decimal AmexNetProfitUsd { get; private set; }      // TotalAmountUsd - TibTotalCostUsd

    // Información de Registro de Pago (Moneda PEN/USD, Vía Yape/BCP, N° Operación)
    public bool IsPaid { get; private set; }
    public string PaymentCurrency { get; private set; } = "PEN";  // PEN (Soles) o USD (Dólares)
    public string PaymentMethod { get; private set; } = "YAPE";   // YAPE, PLIN, BCP_TRANSFER, BBVA_TRANSFER, CASH, CARD
    public string PaymentReference { get; private set; } = "";    // N° Operación / Constancia (ej: OP-982341)
    public string? PaymentProofUrl { get; private set; }          // Comprobante / Voucher de Pago
    public decimal PaidAmount { get; private set; }
    public DateTime? PaidAt { get; private set; }

    public DateTime OrderDate { get; private set; }

    public virtual Customer Customer { get; private set; } = null!;
    public virtual Package Package { get; private set; } = null!;

    private ImportOrder() { }

    public ImportOrder(
        Guid customerId,
        Guid packageId,
        decimal weightKg,
        decimal declaredValueUsd,
        decimal amexFreightRatePerKg = 12.00m,
        decimal amexAdminFeeUsd = 5.00m,
        decimal tibRatePerKg = 7.50m,
        decimal exchangeRate = 3.75m)
    {
        if (weightKg <= 0) throw new DomainException("El peso debe ser mayor a 0 Kg.");
        if (exchangeRate <= 0) throw new DomainException("El tipo de cambio debe ser mayor a 0.");

        CustomerId = customerId;
        PackageId = packageId;
        WeightKg = weightKg;
        AmexFreightRatePerKg = amexFreightRatePerKg;
        AmexAdminFeeUsd = amexAdminFeeUsd;
        TibRatePerKg = tibRatePerKg;
        ExchangeRate = exchangeRate;

        // 1. Cálculo de Flete Comercial Amex
        FreightCostUsd = weightKg * amexFreightRatePerKg;

        // 2. Cálculo de Impuestos SUNAT (Categoría C > $200 USD)
        if (declaredValueUsd > 200)
        {
            var cif = declaredValueUsd + FreightCostUsd;
            AdValoremTaxUsd = Math.Round(cif * 0.04m, 2);
            IgvTaxUsd = Math.Round((cif + AdValoremTaxUsd) * 0.18m, 2);
            TotalTaxesUsd = AdValoremTaxUsd + IgvTaxUsd;
        }
        else
        {
            AdValoremTaxUsd = 0;
            IgvTaxUsd = 0;
            TotalTaxesUsd = 0;
        }

        // 3. Totales a cobrar al cliente
        TotalAmountUsd = FreightCostUsd + AmexAdminFeeUsd + TotalTaxesUsd;
        TotalAmountPen = Math.Round(TotalAmountUsd * exchangeRate, 2);

        // 4. Margen Financiero Neto Amex
        TibTotalCostUsd = (weightKg * tibRatePerKg) + TotalTaxesUsd;
        AmexNetProfitUsd = TotalAmountUsd - TibTotalCostUsd;

        OrderDate = DateTime.UtcNow;
        IsPaid = false;
    }

    public void RegisterPayment(string currency, string method, string reference, decimal amount, string? proofUrl = null)
    {
        PaymentCurrency = string.IsNullOrWhiteSpace(currency) ? "PEN" : currency.Trim().ToUpperInvariant();
        PaymentMethod = string.IsNullOrWhiteSpace(method) ? "YAPE" : method.Trim().ToUpperInvariant();
        PaymentReference = string.IsNullOrWhiteSpace(reference) ? "DIRECTO" : reference.Trim().ToUpperInvariant();
        if (!string.IsNullOrWhiteSpace(proofUrl))
        {
            PaymentProofUrl = proofUrl.Trim();
        }
        PaidAmount = amount > 0 ? amount : (PaymentCurrency == "PEN" ? TotalAmountPen : TotalAmountUsd);
        PaidAt = DateTime.UtcNow;
        IsPaid = true;
    }
}
