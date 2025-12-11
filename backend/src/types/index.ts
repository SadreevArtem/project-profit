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
export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  CNY = 'CNY',
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
  costOfMoney: number;
  additionalExpensesPercent: number;
  operationalActivitiesPercent: number;
  bankCurrencySalesRatio: number; //Коэффициент продажи валюты
  companyProfit: number; // Прибыль компании
  companyProfitMinusVAT: number; // Прибыль компании за вычетом НДС
  companyProfitMinusTAX: number; // Прибыль компании за вычетом налога на прибыль
  projectProfitability: number; // Рентабельность проекта
  percentShareInProfit: number; // % доли *** в прибыли
  agentServices: number; // услуги агента
  markup: number; // наценка
  currentCourseRate: number;
  dutyPercent: number;
  dutyTotal: number;
  brokerage: number;
  customsVat: number;
  totalPurchaseDDP: number;
  requiredFundsForCustoms: number;
  currency: string; //валюта закупки
  deliveryToRF: number; //доставка до РФ
  currencyDelivery: Currency;
  deliveryTimeLogisticsToRF: number; // Срок доставки до РФ
  transferFee: number; // Комиссия за перевод %
  deliveryRF: number; // Доставка по РФ
  deliveryTimeLogisticsRF: number; //срок доставки по РФ
  daysForRegistration: number; // Дни на оформление
  certification: number; // Сертификация
};
