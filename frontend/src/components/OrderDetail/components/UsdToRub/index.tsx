import {
  FieldErrors,
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { Inputs } from "../../OrderDetail";
import {
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { Button } from "@/components/Button";
import { Currency, Order } from "../../../../../shared/types";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { FormattedInput } from "@/components/FormattedInput";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appToast } from "@/components/AppToast/components/lib/appToast";
import { api } from "../../../../../shared/api/api";

type Props = {
  errors: FieldErrors<Inputs>;
  order?: Order;
  token: string;
  getValues: UseFormGetValues<Inputs>;
  setValue: UseFormSetValue<Inputs>;
  watch: UseFormWatch<Inputs>;
  isAgreed: boolean;
};

export const UsdToRub: React.FC<Props> = ({
  isAgreed,
  errors,
  order,
  token,
  getValues,
  setValue,
  watch,
}) => {
  const queryClient = useQueryClient();
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
  const [currencyDelivery, setCurrencyDelivery] = useState<string>(
    order?.parameters?.currencyDelivery || Currency.USD
  );

  const handleChangeCurrency = (event: SelectChangeEvent) => {
    setCurrency(event.target.value as Currency);
    setValue("parameters.currency", event.target.value as Currency);
  };
  const handleChangeCurrencyDelivery = (event: SelectChangeEvent) => {
    setCurrencyDelivery(event.target.value as Currency);
    setValue("parameters.currencyDelivery", event.target.value as Currency);
  };
  const keysToRemove = ["owner", "customer", "customerId", "ownerId"];
  const getQueryKey = (id: number) => ["order"].concat(id.toString());

  const currentValues = getValues();

  const filteredValues: Partial<Order> = Object.fromEntries(
    Object.entries(currentValues).filter(([key]) => !keysToRemove.includes(key))
  );

  const calculateOrderFunc = (input: Order) =>
    api.calculateOrderUSDRequest(input, token);

  const { mutate: calculateMutation, isPending } = useMutation({
    mutationFn: calculateOrderFunc,
    onSuccess: () => {
      appToast.success("success");
      queryClient.invalidateQueries({ queryKey: getQueryKey(order?.id || 0) });
    },
    onError: () => {
      appToast.error("error");
    },
  });

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
          {/* <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.markup || 0}
            label={"Наценка, %"}
            nameInput="markup"
            setValue={setValue}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>} */}

          {/* <TextField
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
          {errors.parameters && <span className="text-red">{"required"}</span>} */}
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
            defaultValue={order?.parameters?.deliveryToRF || 0}
            label={"Доставка до РФ"}
            nameInput="deliveryToRF"
            setValue={setValue}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <FormControl className={clsx()}>
            <InputLabel id="demo-simple-select-label">
              {"Валюта оплаты доставки"}
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={currencyDelivery}
              defaultValue={order?.parameters?.currencyDelivery}
              label={"Валюта оплаты доставки"}
              onChange={handleChangeCurrencyDelivery}
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
            required
            disabled={isAgreed}
            defaultValue={order?.parameters?.deliveryTimeLogisticsToRF}
            label={"Срок доставки до РФ, мес"}
            type="number"
            inputProps={{
              min: 0,
            }}
            onChange={(event) => {
              setValue(
                "parameters.deliveryTimeLogisticsToRF",
                +event.target.value
              );
            }}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            required
            disabled={isAgreed}
            defaultValue={order?.parameters?.transferFee}
            label={"Комиссия за перевод %"}
            type="number"
            inputProps={{
              min: 0,
            }}
            onChange={(event) => {
              setValue("parameters.transferFee", +event.target.value);
            }}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.deliveryRF || 0}
            label={"Доставка по РФ, руб"}
            nameInput="deliveryRF"
            setValue={setValue}
          />
          <TextField
            variant="outlined"
            required
            disabled={isAgreed}
            defaultValue={order?.parameters?.deliveryTimeLogisticsRF}
            label={"срок доставки по РФ, мес"}
            type="number"
            inputProps={{
              min: 0,
            }}
            onChange={(event) => {
              setValue(
                "parameters.deliveryTimeLogisticsRF",
                +event.target.value
              );
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
          <h2 className="py-2 font-bold">Таможня:</h2>
          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.daysForRegistration || 0}
            label={"Дни на оформление"}
            nameInput="daysForRegistration"
            setValue={setValue}
          />
          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.certification || 0}
            label={"Сертификация"}
            nameInput="certification"
            setValue={setValue}
          />
        </div>
        <div className="flex flex-col gap-8 w-[400px] bg-[#e9f5f7] mt-2 p-2">
          <h2 className="py-2 font-bold">Прочие расходы:</h2>

          <FormattedInput
            isAgreed={isAgreed}
            nameInput="operationalActivitiesPercent"
            defaultValue={order?.parameters?.operationalActivitiesPercent || 0}
            label={"Операционная деятельность, %"}
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
          <FormattedInput
            isAgreed={isAgreed}
            nameInput="markup"
            defaultValue={order?.parameters?.markup || 0}
            label={"Наценка"}
            setValue={setValue}
          />
        </div>
      </div>
      <div className="flex gap-8 mb-6">
        {isPending ? (
          <CircularProgress />
        ) : (
          <Button
            disabled={true}
            title={"выполнить расчет"}
            onButtonClick={() =>
              calculateMutation({
                ...(filteredValues as Order),
              })
            }
            type="button"
          />
        )}

        {order?.filePath && (
          <div className="flex w-full justify-center">
            <div className="relative lg:h-[64px] h-[88px] lg:max-w-[64px] bg-gray-purple z-0 rounded-4 max-md:mx-auto w-full">
              <Link target="blanc" href={order?.filePath || ""}>
                <Image
                  src={`/files-images/${"xls"}.svg`}
                  width={100}
                  height={100}
                  alt="изображение"
                  className="absolute left-0 right-0 top-0 bottom-0 m-auto max-md:w-[56px]"
                />
              </Link>
            </div>
          </div>
        )}
        {/* <Button title={"отклонить"} onButtonClick={() => {}} type="button" /> */}
      </div>
      {order?.parameters?.companyProfit && (
        <div className="flex flex-col gap-8 w-[400px] bg-[#f4faed] mt-2 p-2">
          <h2 className="py-2 font-bold">Расчет прибыли проекта:</h2>
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.companyProfit}
            value={new Intl.NumberFormat("ru-RU").format(
              order?.parameters?.companyProfit
            )}
            label={"Прибыль компании, РУБ"}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.companyProfitMinusVAT}
            value={new Intl.NumberFormat("ru-RU").format(
              order?.parameters?.companyProfitMinusVAT
            )}
            label={"Прибыль компании за вычетом НДС, РУБ"}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.companyProfitMinusTAX}
            value={new Intl.NumberFormat("ru-RU").format(
              order?.parameters?.companyProfitMinusTAX
            )}
            label={"Прибыль компании за вычетом налога на прибыль, РУБ"}
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <h2 className="font-bold">Рентабельность проекта, %</h2>
          <TextField
            variant="outlined"
            disabled
            className={clsx({
              "bg-rose-300": order?.parameters?.projectProfitability < 20,
              "bg-green-500": order?.parameters?.projectProfitability > 20,
            })}
            defaultValue={order?.parameters?.projectProfitability}
            value={Math.round(order?.parameters?.projectProfitability)}
            // label={"Рентабельность проекта, %"}
            type="number"
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
          <h2 className="font-bold">% доли *** в прибыли, %</h2>
          <TextField
            variant="outlined"
            disabled
            className={clsx({
              "bg-rose-300": order?.parameters?.percentShareInProfit < 25,
              "bg-green-500": order?.parameters?.percentShareInProfit > 25,
            })}
            defaultValue={order?.parameters?.percentShareInProfit}
            value={Math.round(order?.parameters?.percentShareInProfit)}
            type="number"
          />
          {errors.parameters && <span className="text-red">{"required"}</span>}
        </div>
      )}
    </>
  );
};
