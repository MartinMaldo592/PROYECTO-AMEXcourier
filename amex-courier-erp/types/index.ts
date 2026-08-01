// Definiciones de tipos para AMEX Courier ERP

export type LocationType = 'TibCourierMiami' | 'TibCourierTingoMaria' | 'AmexLince' | 'Delivered';
export type DeliveryMethodType = 'LincePickup' | 'AmexVehicleDelivery' | 'NationalAgency';
export type DeliveryStatusType = 'InWarehouse' | 'InTransitAmexVehicle' | 'DeliveredAtHome' | 'PickedUpAtWarehouse';
export type PaymentCurrencyType = 'PEN' | 'USD';

export interface Customer {
  id: string;
  lockerCode: string; // Ej: AMEX-PER-1001
  name: string;
  taxId: string;     // DNI / RUC
  phone?: string;
  email?: string;
  department: string;
  province: string;
  district: string;
  deliveryAddress?: string;
  preferredCarrier?: string;
  destinationAgency?: string;
  dniFrontUrl?: string;
  dniBackUrl?: string;
  createdAt: string;
}

export interface Package {
  id: string;
  customerId?: string;
  shipmentId?: string;
  lockerCode: string;
  warehouseReceiptNumber: string; // Ej: WR-000451
  trackingUsa: string;
  packageType: string;           // CAJA, SOBRE, SAC
  invoiceNumber?: string;
  customsDni?: string;
  customsConsigneeName?: string;
  description: string;
  weightKg: number;
  declaredValueUsd: number;
  currentLocation: LocationType;
  deliveryMethod: DeliveryMethodType;
  deliveryStatus: DeliveryStatusType;
  invoicePdfUrl?: string;
  createdAt: string;
}

export interface Shipment {
  id: string;
  masterGuideCode: string;       // Ej: AMX0000001269
  partnerRefNumber?: string;     // Ej: WR-TIB-8812
  originWarehouse: string;
  destinationWarehouse: string;
  dispatchedFromMiamiAt: string;
  receivedInPeruAt?: string;
  status: 'EN_TRANSITO' | 'RECIBIDO_PERU' | 'COMPLETADO';
  notes?: string;
  createdAt: string;
}

export interface ImportOrder {
  id: string;
  packageId: string;
  lockerCode: string;
  customerName: string;
  freightAmountUsd: number;
  adminFeeUsd: number;
  totalAmountUsd: number;
  paidAmount: number;
  paymentCurrency: PaymentCurrencyType;
  paymentMethod?: string;
  paymentReference?: string;
  paymentProofUrl?: string;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
}

export interface PackageTrackingLog {
  id: string;
  packageId: string;
  location: string;
  eventDescription: string;
  operatorUsername?: string;
  timestamp: string;
}

export interface UserSession {
  id: string;
  username: string;
  fullName: string;
  email: string;
  roleName: string;
  customPermissions?: string;
  isActive: boolean;
}
