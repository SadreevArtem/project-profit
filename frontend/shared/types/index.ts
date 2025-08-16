export type TJwtPayload = {
  sub: number;
  username: string;
  endContract?: Date | null;
  iat: number;
  exp: number;
};

export type User = {
  id: number;
  username: string;
  about: string;
  adressOneLine: string;
  adressTwoLine: string;
  phone: string;
  avatar: string;
  email: string;
  password?: string;
  role: UserRole;
  endContract?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export enum UserRole {
  ADMIN = "admin",
  TENDER_MANAGER = "tender_manager",
}

export enum OrderStatus {
  DRAFT = "DRAFT",
  UNDER_APPROVAL = "UNDER_APPROVAL",
  AGREED = "AGREED",
}

export enum TypeOrder {
  RUBTORUB = "RUBTORUB",
  RUBTORUBVAT = "RUBTORUBVAT",
  USDTORUB = "USDTORUB",
}

export type Customer = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

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

export type Order = {
  id: number;
  contractNumber: string;
  complectName: string;
  parameters: Parameters;
  customer: Customer;
  owner: User;
  orderStatus: OrderStatus;
  typeOrder: TypeOrder;
  createdAt: Date;
  updatedAt: Date;
  documentationSheet: boolean;
};

export type FilesModel = {
  originalname: string;
  filename: string;
  path: string;
};

export type MaterialEntry = {
  rod: string; // шток
  wedge: string; // клин
  seat: string; // седло
};

export type FlangeMaterialEntry = {
  studs: string; // Шпильки
  nuts: string; // Гайки
};

type Size = string; // Например: '1/2"', '3/4"'
type Length = number;

export type ConnectionType = {
  [key in Size]: Length;
};

type PressureClass = {
  [key: string]: ConnectionType; // Например: "RF|B", "BW", "RF|B|BW", "RTJ|J"
};

export type LengthTable = {
  [key: string]: PressureClass; // Например: "150#", "300#", "600#"
};
