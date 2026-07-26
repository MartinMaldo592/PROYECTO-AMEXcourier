namespace MiniERP.Domain.Enums;

public enum DeliveryMethod
{
    LincePickup = 1,        // Recojo Presencial en Almacén Lince
    AmexVehicleDelivery = 2,// Entrega a Domicilio con Vehículo/Carro Propio Amex
    NationalAgency = 3       // Despacho por Agencia Nacional (Shalom, Olva, Cruz del Sur)
}

public enum DeliveryStatus
{
    PendingInWarehouse = 1,  // En Custodia Almacén Lince
    InTransitAmexVehicle = 2,// En Ruta con Carro de Reparto Amex
    DeliveredAtHome = 3,     // Entregado Exitosamente en Domicilio
    PickedUpAtWarehouse = 4, // Recogido por Cliente en Almacén Lince
    DispatchedToAgency = 5   // Entregado a Agencia de Transportes
}
