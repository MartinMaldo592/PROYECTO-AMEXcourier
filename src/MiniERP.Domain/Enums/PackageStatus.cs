namespace MiniERP.Domain.Enums;

public enum PackageStatus
{
    PreRegisteredWhatsApp = 1,     // Pre-registrado por cliente vía WhatsApp
    ReceivedAtMiami = 2,           // Recibido en Almacén Tib Courier Miami
    ArrivedAtTingoMaria = 3,       // Arribó a Lima (Almacén Tib Courier Tingo María)
    TransferredToAmexLince = 4,    // Recogido y trasladado a Almacén Amex (Lince)
    ReadyForPaymentAndDelivery = 5,// En Lince, listo para liquidación y cobro
    Delivered = 6                  // Entregado previa cobranza
}
