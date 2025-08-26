import { FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Inputs } from "../../OrderDetail";
import { TextField } from "@mui/material";
import { Order } from "../../../../../shared/types";
import { useEffect } from "react";
import { gt, negate } from "rambda";
import clsx from "clsx";

type Props = {
  errors: FieldErrors<Inputs>;
  order?: Order;
  setValue: UseFormSetValue<Inputs>;
  watch: UseFormWatch<Inputs>;
  isAgreed: boolean;
};

export const UsdToRub: React.FC<Props> = ({
  isAgreed,
  errors,
  order,
  setValue,
  watch,
}) => {
  const salesWithVAT = watch("parameters.salesWithVAT");
  const operationalActivities = watch("parameters.operationalActivities") || 0;
  const additionalExpenses = watch("parameters.additionalExpenses") || 0;
  const otherUnplannedExpenses =
    watch("parameters.otherUnplannedExpenses") || 0;
  const purchase = watch("parameters.purchase") || 0;
  const prepayment = watch("parameters.prepayment") || 0;
  const prepaymentSale = watch("parameters.prepaymentSale") || 0;
  const prepaymentToSupplier = watch("parameters.prepaymentToSupplier") || 0;
  const prepaymentFromCustomer =
    watch("parameters.prepaymentFromCustomer") || 0;
  const deltaOnPrepayment = watch("parameters.deltaOnPrepayment") || 0;
  const delivery = watch("parameters.delivery") || 0;
  const requiredFundsPrepayment =
    watch("parameters.requiredFundsPrepayment") || 0;
  const costOfMoney = watch("parameters.costOfMoney") || 0;
  const productionTime = watch("parameters.productionTime") || 0;
  const deliveryTimeLogistics = watch("parameters.deliveryTimeLogistics") || 0;
  const deferralPaymentByCustomer =
    watch("parameters.deferralPaymentByCustomer") || 0;
  const requiredFundsShipment = watch("parameters.requiredFundsShipment") || 0;
  const costOfMoneyPrepayment = watch("parameters.costOfMoneyPrepayment") || 0;
  const costOfMoneyShipment = watch("parameters.costOfMoneyShipment") || 0;
  const totalCostOfMoney = watch("parameters.totalCostOfMoney") || 0;
  const totalOtherExpenses = watch("parameters.totalOtherExpenses") || 0;
  const companyProfit = watch("parameters.companyProfit") || 0;
  const companyProfitMinusVAT = watch("parameters.companyProfitMinusVAT") || 0;
  const companyProfitMinusTAX = watch("parameters.companyProfitMinusTAX") || 0;
  const projectProfitability = watch("parameters.projectProfitability") || 0;
  const percentShareInProfit = watch("parameters.percentShareInProfit") || 0;
  const dutyTotal = watch("parameters.dutyTotal") || 0;
  const purchaseCurrencyRate = watch("parameters.purchaseCurrencyRate") || 0;
  const bankSellingRate = watch("parameters.bankSellingRate") || 0;
  const dutyPercent = watch("parameters.dutyPercent") || 0;
  const brokerage = watch("parameters.brokerage") || 0;
  const customsVat = watch("parameters.customsVat") || 0;
  const currentCourseRate = watch("parameters.currentCourseRate") || 0;
  const totalPurchaseDDP = watch("parameters.totalPurchaseDDP") || 0;
  const deltaPaymentBeforeShipment =
    watch("parameters.deltaPaymentBeforeShipment") || 0;
  const requiredFundsForCustoms =
    watch("parameters.requiredFundsForCustoms") || 0;
  const operationalActivitiesPercent =
    watch("parameters.operationalActivitiesPercent") || 0;

  useEffect(() => {
    setValue(
      "parameters.operationalActivities",
      salesWithVAT * operationalActivitiesPercent * 0.01
    );
  }, [setValue, salesWithVAT, operationalActivitiesPercent]);

  useEffect(() => {
    setValue("parameters.prepaymentToSupplier", purchase * prepayment * 0.01);
  }, [setValue, purchase, prepayment]);

  useEffect(() => {
    setValue(
      "parameters.prepaymentFromCustomer",
      (salesWithVAT * prepaymentSale * 0.01) / currentCourseRate
    );
  }, [setValue, salesWithVAT, prepaymentSale, currentCourseRate]);

  useEffect(() => {
    setValue(
      "parameters.totalOtherExpenses",
      operationalActivities + additionalExpenses + otherUnplannedExpenses
    );
  }, [
    setValue,
    operationalActivities,
    additionalExpenses,
    otherUnplannedExpenses,
  ]);

  useEffect(() => {
    setValue(
      "parameters.deltaOnPrepayment",
      negate(prepaymentToSupplier - prepaymentFromCustomer)
    );
  }, [setValue, prepaymentToSupplier, prepaymentFromCustomer]);

  useEffect(() => {
    setValue(
      "parameters.deltaPaymentBeforeShipment",
      purchase - prepaymentFromCustomer
    );
  }, [setValue, purchase, prepaymentFromCustomer]);

  useEffect(() => {
    setValue(
      "parameters.requiredFundsPrepayment",
      gt(deltaOnPrepayment, 0) ? 0 : negate(deltaOnPrepayment)
    );
  }, [setValue, deltaOnPrepayment]);

  useEffect(() => {
    setValue(
      "parameters.requiredFundsShipment",
      totalPurchaseDDP - prepaymentFromCustomer
    );
  }, [setValue, totalPurchaseDDP, prepaymentFromCustomer]);

  useEffect(() => {
    setValue(
      "parameters.costOfMoneyRub",
      (deltaPaymentBeforeShipment + requiredFundsForCustoms) *
        costOfMoney *
        0.01
    );
  }, [
    setValue,
    deltaPaymentBeforeShipment,
    costOfMoney,
    requiredFundsForCustoms,
  ]);

  useEffect(() => {
    setValue(
      "parameters.costOfMoneyPrepayment",
      requiredFundsPrepayment *
        (costOfMoney * 0.01) *
        (productionTime + deliveryTimeLogistics + deferralPaymentByCustomer)
    );
  }, [
    setValue,
    requiredFundsPrepayment,
    costOfMoney,
    productionTime,
    deliveryTimeLogistics,
    deferralPaymentByCustomer,
  ]);

  useEffect(() => {
    const result =
      requiredFundsShipment *
      (costOfMoney * 0.01) *
      (deliveryTimeLogistics + deferralPaymentByCustomer);
    setValue("parameters.costOfMoneyShipment", +result.toFixed());
  }, [
    setValue,
    requiredFundsShipment,
    costOfMoney,
    productionTime,
    deliveryTimeLogistics,
    deferralPaymentByCustomer,
  ]);

  useEffect(() => {
    setValue(
      "parameters.totalCostOfMoney",
      costOfMoneyPrepayment + costOfMoneyShipment
    );
  }, [setValue, costOfMoneyShipment, costOfMoneyPrepayment]);

  useEffect(() => {
    setValue(
      "parameters.companyProfit",
      Math.round(
        salesWithVAT -
          totalPurchaseDDP * currentCourseRate -
          totalCostOfMoney * currentCourseRate -
          totalOtherExpenses
      )
    );
  }, [
    setValue,
    salesWithVAT,
    totalPurchaseDDP,
    currentCourseRate,
    totalCostOfMoney,
    totalOtherExpenses,
  ]);
  useEffect(() => {
    setValue(
      "parameters.companyProfitMinusVAT",
      companyProfit - companyProfit * 0.25
    );
  }, [setValue, companyProfit]);

  useEffect(() => {
    setValue(
      "parameters.companyProfitMinusTAX",
      (companyProfitMinusVAT / 5) * 4
    );
  }, [setValue, companyProfitMinusVAT]);

  useEffect(() => {
    setValue(
      "parameters.projectProfitability",
      Math.round((companyProfitMinusTAX / salesWithVAT) * 100)
    );
  }, [setValue, companyProfitMinusTAX, salesWithVAT]);

  useEffect(() => {
    setValue(
      "parameters.percentShareInProfit",
      Math.round((additionalExpenses / companyProfitMinusTAX) * 100)
    );
  }, [setValue, additionalExpenses, companyProfitMinusTAX]);

  useEffect(() => {
    setValue("parameters.brokerage", (purchase + delivery + dutyTotal) * 0.02);
  }, [setValue, purchase, delivery, dutyTotal]);

  useEffect(() => {
    setValue(
      "parameters.currentCourseRate",
      purchaseCurrencyRate + purchaseCurrencyRate * bankSellingRate * 0.01
    );
  }, [setValue, purchaseCurrencyRate, bankSellingRate]);

  useEffect(() => {
    setValue(
      "parameters.dutyTotal",
      (purchase + delivery) * dutyPercent * 0.01
    );
  }, [setValue, purchase, delivery, dutyPercent]);
  useEffect(() => {
    setValue(
      "parameters.customsVat",
      (purchase + delivery + brokerage + dutyTotal) * 0.2
    );
  }, [setValue, purchase, delivery, brokerage, dutyTotal]);

  useEffect(() => {
    setValue(
      "parameters.totalPurchaseDDP",
      purchase + brokerage + dutyTotal + customsVat + delivery
    );
  }, [setValue, purchase, brokerage, dutyTotal, delivery, customsVat]);

  useEffect(() => {
    setValue("parameters.requiredFundsForCustoms", totalPurchaseDDP - purchase);
  }, [setValue, purchase, totalPurchaseDDP]);

  return (
    <>
      <div className="flex gap-8 mb-6">
        <div className="flex flex-col gap-8 w-[400px]">
          <h2 className="font-bold">Закупка:</h2>
          <TextField
            variant="outlined"
            required
            disabled={isAgreed}
            defaultValue={order?.parameters?.purchaseCurrencyRate}
            label={"Курс валюты закупки"}
            type="number"
            inputProps={{
              min: 0,
            }}
            onChange={(event) => {
              setValue("parameters.purchaseCurrencyRate", +event.target.value);
            }}
          />
          <TextField
            variant="outlined"
            required
            disabled={isAgreed}
            defaultValue={order?.parameters?.bankSellingRate}
            label={"Курс продажи банком, %"}
            type="number"
            inputProps={{
              min: 0,
            }}
            onChange={(event) => {
              setValue("parameters.bankSellingRate", +event.target.value);
            }}
          />
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.currentCourseRate}
            label={"Расчетный курс, Руб"}
            type="number"
            value={watch("parameters.currentCourseRate")}
          />
          <TextField
            variant="outlined"
            required
            disabled={isAgreed}
            defaultValue={order?.parameters?.purchase}
            label={"Закупка, в валюте"}
            type="number"
            inputProps={{
              min: 0,
            }}
            onChange={(event) => {
              setValue("parameters.purchase", +event.target.value);
            }}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            required
            disabled={isAgreed}
            defaultValue={order?.parameters?.productionTime}
            label={"Срок производсва, мес"}
            type="number"
            inputProps={{
              min: 0,
            }}
            onChange={(event) => {
              setValue("parameters.productionTime", +event.target.value);
            }}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}

          <h2 className="py-2 font-bold">Условия оплаты:</h2>
          <TextField
            variant="outlined"
            required
            disabled={isAgreed}
            defaultValue={order?.parameters?.prepayment}
            label={"Предоплата, %"}
            type="number"
            inputProps={{
              min: 0,
              max: 100,
            }}
            onChange={(event) => {
              setValue("parameters.prepayment", +event.target.value);
            }}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            required
            disabled={isAgreed}
            defaultValue={order?.parameters?.paymentBeforeShipment}
            label={"Перед отгрузкой, %"}
            type="number"
            inputProps={{
              min: 0,
              max: 100,
            }}
            onChange={(event) => {
              setValue("parameters.paymentBeforeShipment", +event.target.value);
            }}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
        </div>
        <div className="flex flex-col gap-8 px-2 w-[400px] bg-[#ffe3ed]">
          <h2 className="font-bold">Продажа:</h2>
          <TextField
            variant="outlined"
            required
            disabled={isAgreed}
            defaultValue={order?.parameters?.salesWithVAT}
            label={"Продажа с НДС, РУБ"}
            inputProps={{
              min: 0,
            }}
            type="number"
            onChange={(event) => {
              setValue("parameters.salesWithVAT", +event.target.value);
            }}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            required
            disabled={isAgreed}
            defaultValue={order?.parameters?.dutyPercent}
            label={"Пошлина, %"}
            inputProps={{
              min: 0,
            }}
            type="number"
            onChange={(event) => {
              setValue("parameters.dutyPercent", +event.target.value);
            }}
          />
          <TextField
            variant="outlined"
            required
            disabled={isAgreed}
            defaultValue={order?.parameters?.deliveryTime}
            label={"Срок поставки, мес"}
            type="number"
            onChange={(event) => {
              setValue("parameters.deliveryTime", +event.target.value);
            }}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <h2 className="py-2 font-bold">Условия оплаты:</h2>
          <TextField
            variant="outlined"
            required
            disabled={isAgreed}
            defaultValue={order?.parameters?.prepaymentSale}
            label={"Предоплата, %"}
            inputProps={{
              min: 0,
              max: 100,
            }}
            type="number"
            onChange={(event) => {
              setValue("parameters.prepaymentSale", +event.target.value);
            }}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            required
            disabled={isAgreed}
            defaultValue={order?.parameters?.paymentBeforeShipmentSale}
            label={"Перед отгрузкой, %"}
            type="number"
            inputProps={{
              min: 0,
              max: 100,
            }}
            onChange={(event) => {
              setValue(
                "parameters.paymentBeforeShipmentSale",
                +event.target.value
              );
            }}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
        </div>
      </div>
      <div className="flex gap-8 mb-6">
        <div className="flex flex-col gap-8 w-[400px] bg-[#e9f5f7] mt-2 p-2">
          <h2 className="py-2 font-bold">Таможня и логистика:</h2>
          <TextField
            variant="outlined"
            required
            disabled={isAgreed}
            defaultValue={order?.parameters?.delivery}
            label={"Доставка, в валюте"}
            type="number"
            inputProps={{
              min: 0,
            }}
            onChange={(event) => {
              setValue("parameters.delivery", +event.target.value);
            }}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            required
            disabled={isAgreed}
            defaultValue={order?.parameters?.deliveryTimeLogistics}
            label={"Срок поставки, мес"}
            type="number"
            inputProps={{
              min: 0,
            }}
            onChange={(event) => {
              setValue("parameters.deliveryTimeLogistics", +event.target.value);
            }}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            required
            disabled={isAgreed}
            defaultValue={order?.parameters?.deferralPaymentByCustomer}
            label={"Отсрочка оплаты заказчика"}
            type="number"
            inputProps={{
              min: 0,
            }}
            onChange={(event) => {
              setValue(
                "parameters.deferralPaymentByCustomer",
                +event.target.value
              );
            }}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.dutyTotal}
            label={"Пошлина в валюте"}
            type="number"
            value={watch("parameters.dutyTotal")}
          />
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.brokerage}
            label={"Брокерские"}
            type="number"
            value={watch("parameters.brokerage")}
          />
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.customsVat}
            label={"НДС на таможне"}
            type="number"
            value={watch("parameters.customsVat")}
          />
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.totalPurchaseDDP}
            label={"Итого закупка на DDP"}
            type="number"
            value={watch("parameters.totalPurchaseDDP")}
          />
        </div>
        <div className="flex flex-col gap-8 w-[400px] bg-[#e9f5f7] mt-2 p-2">
          <h2 className="py-2 font-bold">Прочие расходы:</h2>
          <TextField
            variant="outlined"
            required
            disabled={isAgreed}
            defaultValue={order?.parameters?.operationalActivitiesPercent}
            label={"Операционная деятельность, %"}
            type="number"
            inputProps={{
              min: 0,
            }}
            onChange={(event) => {
              setValue(
                "parameters.operationalActivitiesPercent",
                +event.target.value
              );
            }}
          />
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.operationalActivities}
            label={"Операционная деятельность, руб"}
            type="number"
            value={watch("parameters.operationalActivities")}
          />
          <TextField
            variant="outlined"
            disabled={isAgreed}
            defaultValue={order?.parameters?.additionalExpenses}
            label={"Дополнительные расходы, РУБ"}
            type="number"
            inputProps={{
              min: 0,
            }}
            onChange={(event) => {
              setValue("parameters.additionalExpenses", +event.target.value);
            }}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled={isAgreed}
            defaultValue={order?.parameters?.otherUnplannedExpenses}
            label={"Прочие незапланированные расходы"}
            type="number"
            inputProps={{
              min: 0,
            }}
            onChange={(event) => {
              setValue(
                "parameters.otherUnplannedExpenses",
                +event.target.value
              );
            }}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.totalOtherExpenses}
            value={watch("parameters.totalOtherExpenses")}
            label={"Итого прочие расходы"}
            type="number"
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
        </div>
      </div>
      <div className="flex gap-8 mb-6">
        <div className="flex flex-col gap-8 w-[400px] bg-[#e9f5f7] mt-2 p-2">
          <h2 className="py-2 font-bold">Инвестиции:</h2>
          <TextField
            variant="outlined"
            disabled={isAgreed}
            defaultValue={order?.parameters?.costOfMoney}
            label={"Стоимость денег, %"}
            type="number"
            inputProps={{
              min: 0,
              max: 15,
            }}
            onChange={(event) => {
              setValue("parameters.costOfMoney", +event.target.value);
            }}
          />

          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.prepaymentToSupplier}
            value={watch("parameters.prepaymentToSupplier")}
            label={"Предоплата поставщику, в валюте"}
            type="number"
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.prepaymentFromCustomer}
            value={watch("parameters.prepaymentFromCustomer")}
            label={"Предоплата от заказчика, в валюте"}
            type="number"
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.deltaOnPrepayment}
            value={watch("parameters.deltaOnPrepayment")}
            label={"Дельта на предоплату, РУБ"}
            type="number"
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.deltaPaymentBeforeShipment}
            value={watch("parameters.deltaPaymentBeforeShipment")}
            label={"Дельта на оплату перед отгрузкой, РУБ"}
            type="number"
          />
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.requiredFundsForCustoms}
            value={watch("parameters.requiredFundsForCustoms")}
            label={"Требуемые средства для таможни"}
            type="number"
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.requiredFundsPrepayment}
            value={watch("parameters.requiredFundsPrepayment")}
            label={"Требуемые средства на предоплату, РУБ"}
            type="number"
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.requiredFundsShipment}
            value={watch("parameters.requiredFundsShipment")}
            label={"Требуемые средства на отгрузку"}
            type="number"
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.costOfMoneyRub}
            value={watch("parameters.costOfMoneyRub")}
            label={"Стоимость денег мес"}
            type="number"
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.costOfMoneyPrepayment}
            value={watch("parameters.costOfMoneyPrepayment")}
            label={"Стоимость денег на предоплату, РУБ"}
            type="number"
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.costOfMoneyShipment}
            value={watch("parameters.costOfMoneyShipment")}
            label={"Стоимость денег на отгрузку, РУБ"}
            type="number"
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.totalCostOfMoney}
            value={watch("parameters.totalCostOfMoney")}
            label={"Итого стоимость денег, РУБ"}
            type="number"
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
        </div>
        <div className="flex flex-col gap-8 w-[400px] bg-[#f4faed] mt-2 p-2">
          <h2 className="py-2 font-bold">Расчет прибыли проекта:</h2>
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.companyProfit}
            value={watch("parameters.companyProfit")}
            label={"Прибыль компании, РУБ"}
            type="number"
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.companyProfitMinusVAT}
            value={watch("parameters.companyProfitMinusVAT")}
            label={"Прибыль компании за вычетом НДС, РУБ"}
            type="number"
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.companyProfitMinusTAX}
            value={watch("parameters.companyProfitMinusTAX")}
            label={"Прибыль компании за вычетом налога на прибыль, РУБ"}
            type="number"
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <h2 className="font-bold">Рентабельность проекта, %</h2>
          <TextField
            variant="outlined"
            disabled
            className={clsx({
              "bg-rose-300": projectProfitability < 20,
              "bg-green-500": projectProfitability > 20,
            })}
            defaultValue={order?.parameters?.projectProfitability}
            value={watch("parameters.projectProfitability")}
            // label={"Рентабельность проекта, %"}
            type="number"
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <h2 className="font-bold">% доли *** в прибыли, %</h2>
          <TextField
            variant="outlined"
            disabled
            className={clsx({
              "bg-rose-300": percentShareInProfit < 25,
              "bg-green-500": percentShareInProfit > 25,
            })}
            defaultValue={order?.parameters?.percentShareInProfit}
            value={watch("parameters.percentShareInProfit")}
            type="number"
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
        </div>
      </div>
      {/* <TextField
        variant="outlined"
        label={t("purchase")}
        {...register("purchase", { required: true })}
      />
      {errors.contractNumber && (
        <span className="text-red">{t("required")}</span>
      )} */}
    </>
  );
};
