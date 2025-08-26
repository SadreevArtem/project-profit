export enum UserRole {
  ADMIN = 'admin',
  TENDER_MANAGER = 'tender_manager',
  BOSS = 'boss',
}

export enum OrderStatus {
  DRAFT = 'DRAFT',
  UNDER_APPROVAL = 'UNDER_APPROVAL',
  AGREED = 'AGREED',
  REJECTED = 'REJECTED',
}

export enum TypeOrder {
  RUBTORUB = 'RUBTORUB',
  RUBTORUBVAT = 'RUBTORUBVAT',
  USDTORUB = 'USDTORUB',
}

export type Parameters = {
  purchase: number;
  productionTime: number;
  prepayment: number;
  paymentBeforeShipment: number;
  prepaymentSale: number;
  paymentBeforeShipmentSale: number;
  salesWithVAT: number;
  deliveryTime: number;
  delivery: number;
  deliveryTimeLogistics: number;
  deferralPaymentByCustomer: number;
  operationalActivities: number;
  additionalExpenses: number;
  otherUnplannedExpenses: number;
  totalOtherExpenses: number;
};
