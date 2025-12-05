import { FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Inputs } from "../../OrderDetail";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { Currency, Order } from "../../../../../shared/types";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { FormattedInput } from "@/components/FormattedInput";

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
  const [cbrRates, setCbrRates] = useState<{
    USD?: number;
    EUR?: number;
    GBP?: number;
    CNY?: number;
  } | null>(null);
  const [cbrDate, setCbrDate] = useState<string | null>(null);

  const [isRatesError, setIsRatesError] = useState(false);
  const [currency, setCurrency] = useState<string>(
    order?.parameters?.currency || Currency.USD
  );

  const operationalActivities = watch("parameters.operationalActivities") || 0;
  const prepaymentToSupplier = watch("parameters.prepaymentToSupplier") || 0;
  const prepaymentFromCustomer =
    watch("parameters.prepaymentFromCustomer") || 0;
  const deltaOnPrepayment = watch("parameters.deltaOnPrepayment") || 0;
  const requiredFundsPrepayment =
    watch("parameters.requiredFundsPrepayment") || 0;
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
  const brokerage = watch("parameters.brokerage") || 0;
  const customsVat = watch("parameters.customsVat") || 0;
  const totalPurchaseDDP = watch("parameters.totalPurchaseDDP") || 0;
  const deltaPaymentBeforeShipment =
    watch("parameters.deltaPaymentBeforeShipment") || 0;
  const requiredFundsForCustoms =
    watch("parameters.requiredFundsForCustoms") || 0;

  const costOfMoneyRub = watch("parameters.costOfMoneyRub") || 0;

  const handleChangeCurrency = (event: SelectChangeEvent) => {
    setCurrency(event.target.value as Currency);
    setValue("parameters.currency", event.target.value as Currency);
  };

  useEffect(() => {
    const controller = new AbortController();

    fetch("https://www.cbr-xml-daily.ru/daily_json.js", {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        setCbrDate(data?.Date || null);
        setCbrRates({
          USD: data?.Valute?.USD?.Value,
          EUR: data?.Valute?.EUR?.Value,
          GBP: data?.Valute?.GBP?.Value,
          CNY: data?.Valute?.CNY?.Value,
        });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setIsRatesError(true);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (cbrRates) {
      setValue(
        "parameters.purchaseCurrencyRate",
        cbrRates[currency as Currency] || 0
      );
    }
  }, [setValue, cbrRates, currency]);

  return (
    <>
      <div className="mb-6">
        <h2 className="font-bold mb-2">Курс валют ЦБ РФ</h2>
        <div className="text-sm text-gray-600">
          {cbrDate
            ? `Обновлено: ${new Date(cbrDate).toLocaleDateString("ru-RU")}`
            : "Загрузка..."}
        </div>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-[360px] border-collapse border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-3 py-2 text-left">
                  Валюта
                </th>
                <th className="border border-gray-200 px-3 py-2 text-left">
                  Курс, ₽
                </th>
              </tr>
            </thead>
            <tbody>
              {["USD", "EUR", "GBP", "CNY"].map((code) => (
                <tr key={code}>
                  <td className="border border-gray-200 px-3 py-2">{code}</td>
                  <td className="border border-gray-200 px-3 py-2">
                    {cbrRates && cbrRates[code as keyof typeof cbrRates]
                      ? cbrRates[code as keyof typeof cbrRates]?.toLocaleString(
                          "ru-RU",
                          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                        )
                      : isRatesError
                      ? "Ошибка загрузки"
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex gap-8 mb-6">
        <div className="flex flex-col gap-8 w-[400px]">
          <h2 className="font-bold">Закупка:</h2>
          <FormControl className={clsx()}>
            <InputLabel id="demo-simple-select-label">
              {"Валюта закупки"}
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={currency}
              defaultValue={order?.parameters?.currency}
              label={"Валюта закупки"}
              onChange={handleChangeCurrency}
            >
              {Object.values(Currency).map((item, i) => (
                <MenuItem key={i} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.purchaseCurrencyRate}
            label={"Курс валюты закупки"}
            value={new Intl.NumberFormat("ru-RU").format(
              watch("parameters.purchaseCurrencyRate")
            )}
          />
          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.bankCurrencySalesRatio || 0}
            label={"Коэффициент продажи валюты, %"}
            nameInput="bankCurrencySalesRatio"
            setValue={setValue}
          />

          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.agentServices || 0}
            label={"Услуги агента, руб"}
            nameInput="agentServices"
            setValue={setValue}
          />
          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.purchase || 0}
            label={"Закупка, в валюте"}
            nameInput="purchase"
            setValue={setValue}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}

          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.dutyPercent || 0}
            label={"Пошлина, %"}
            nameInput="dutyPercent"
            setValue={setValue}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}

          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.productionTime || 0}
            label={"Срок производсва, мес"}
            nameInput="productionTime"
            setValue={setValue}
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
          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.markup || 0}
            label={"Наценка, %"}
            nameInput="markup"
            setValue={setValue}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}

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

          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.prepaymentSale || 0}
            label={"Предоплата, %"}
            nameInput="prepaymentSale"
            setValue={setValue}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.paymentBeforeShipmentSale || 0}
            label={"Перед отгрузкой, %"}
            nameInput="paymentBeforeShipmentSale"
            setValue={setValue}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
        </div>
      </div>
      <div className="flex gap-8 mb-6">
        <div className="flex flex-col gap-8 w-[400px] bg-[#e9f5f7] mt-2 p-2">
          <h2 className="py-2 font-bold">Таможня и логистика:</h2>
          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.delivery || 0}
            label={"Доставка, в валюте"}
            nameInput="delivery"
            setValue={setValue}
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
            value={new Intl.NumberFormat("ru-RU").format(dutyTotal)}
          />
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.brokerage}
            label={"Брокерские"}
            value={new Intl.NumberFormat("ru-RU").format(brokerage)}
          />
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.customsVat}
            label={"НДС на таможне"}
            value={new Intl.NumberFormat("ru-RU").format(customsVat)}
          />
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.totalPurchaseDDP}
            label={"Итого закупка на DDP"}
            value={new Intl.NumberFormat("ru-RU").format(totalPurchaseDDP)}
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
              max: 100,
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
            value={new Intl.NumberFormat("ru-RU").format(operationalActivities)}
          />
          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.additionalExpenses || 0}
            nameInput="additionalExpenses"
            label={"Дополнительные расходы, РУБ"}
            setValue={setValue}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <FormattedInput
            isAgreed={isAgreed}
            nameInput="otherUnplannedExpenses"
            defaultValue={order?.parameters?.otherUnplannedExpenses || 0}
            label={"Прочие незапланированные расходы"}
            setValue={setValue}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.totalOtherExpenses}
            value={new Intl.NumberFormat("ru-RU").format(totalOtherExpenses)}
            label={"Итого прочие расходы"}
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
            value={new Intl.NumberFormat("ru-RU").format(prepaymentToSupplier)}
            label={"Предоплата поставщику, в валюте"}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.prepaymentFromCustomer}
            value={new Intl.NumberFormat("ru-RU").format(
              prepaymentFromCustomer
            )}
            label={"Предоплата от заказчика, в валюте"}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.deltaOnPrepayment}
            value={new Intl.NumberFormat("ru-RU").format(deltaOnPrepayment)}
            label={"Дельта на предоплату, РУБ"}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.deltaPaymentBeforeShipment}
            value={new Intl.NumberFormat("ru-RU").format(
              deltaPaymentBeforeShipment
            )}
            label={"Дельта на оплату перед отгрузкой, РУБ"}
          />
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.requiredFundsForCustoms}
            value={new Intl.NumberFormat("ru-RU").format(
              requiredFundsForCustoms
            )}
            label={"Требуемые средства для таможни"}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.requiredFundsPrepayment}
            value={new Intl.NumberFormat("ru-RU").format(
              requiredFundsPrepayment
            )}
            label={"Требуемые средства на предоплату, РУБ"}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.requiredFundsShipment}
            value={new Intl.NumberFormat("ru-RU").format(requiredFundsShipment)}
            label={"Требуемые средства на отгрузку"}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.costOfMoneyRub}
            value={new Intl.NumberFormat("ru-RU").format(costOfMoneyRub)}
            label={"Стоимость денег мес"}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.costOfMoneyPrepayment}
            value={new Intl.NumberFormat("ru-RU").format(costOfMoneyPrepayment)}
            label={"Стоимость денег на предоплату, РУБ"}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.costOfMoneyShipment}
            value={new Intl.NumberFormat("ru-RU").format(costOfMoneyShipment)}
            label={"Стоимость денег на отгрузку, РУБ"}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.totalCostOfMoney}
            value={new Intl.NumberFormat("ru-RU").format(totalCostOfMoney)}
            label={"Итого стоимость денег, РУБ"}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
        </div>
        <div className="flex flex-col gap-8 w-[400px] bg-[#f4faed] mt-2 p-2">
          <h2 className="py-2 font-bold">Расчет прибыли проекта:</h2>
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.companyProfit}
            value={new Intl.NumberFormat("ru-RU").format(companyProfit)}
            label={"Прибыль компании, РУБ"}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.companyProfitMinusVAT}
            value={new Intl.NumberFormat("ru-RU").format(companyProfitMinusVAT)}
            label={"Прибыль компании за вычетом НДС, РУБ"}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.companyProfitMinusTAX}
            value={new Intl.NumberFormat("ru-RU").format(companyProfitMinusTAX)}
            label={"Прибыль компании за вычетом налога на прибыль, РУБ"}
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
