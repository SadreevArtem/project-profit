import {
  Control,
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { Inputs } from "../../OrderDetail";
import { CircularProgress, TextField } from "@mui/material";
import { Order } from "../../../../../shared/types";
import { useEffect } from "react";
import { OPERATIONAL_ACTIVITIES } from "../../constants";
import { FormattedInput } from "@/components/FormattedInput";
import { Button } from "@/components/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appToast } from "@/components/AppToast/components/lib/appToast";
import { api } from "../../../../../shared/api/api";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";

type Props = {
  order: Order;
  token: string;
  control: Control<Inputs>;
  getValues: UseFormGetValues<Inputs>;
  setValue: UseFormSetValue<Inputs>;
  watch: UseFormWatch<Inputs>;
  isAgreed: boolean;
};

export const RubToRub: React.FC<Props> = ({
  isAgreed,
  order,
  getValues,
  token,
  control,
  setValue,
  watch,
}) => {
  const queryClient = useQueryClient();
  const salesWithVAT = watch("parameters.salesWithVAT");
  const operationalActivities = watch("parameters.operationalActivities") || 0;
  const additionalExpenses = watch("parameters.additionalExpenses") || 0;
  const productionTime = watch("parameters.productionTime") || 0;
  const deliveryTimeLogistics = watch("parameters.deliveryTimeLogistics") || 0;
  const otherUnplannedExpenses =
    watch("parameters.otherUnplannedExpenses") || 0;

  const additionalExpensesPercent =
    watch("parameters.additionalExpensesPercent") || 0;

  const prepayment = watch("parameters.prepayment") || 0;

  const prepaymentSale = watch("parameters.prepaymentSale") || 0;

  const keysToRemove = ["owner", "customer", "customerId", "ownerId"];

  const calculateOrderFunc = (input: Order) =>
    api.calculateOrderRequest(input, token);

  const getQueryKey = (id: number) => ["order"].concat(id.toString());

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
    setValue(
      "parameters.operationalActivities",
      salesWithVAT * OPERATIONAL_ACTIVITIES
    );
  }, [setValue, salesWithVAT]);
  useEffect(() => {
    setValue(
      "parameters.additionalExpenses",
      (salesWithVAT / 1.2) * (additionalExpensesPercent * 0.01)
    );
  }, [setValue, salesWithVAT, additionalExpensesPercent]);

  useEffect(() => {
    setValue("parameters.deliveryTime", productionTime + deliveryTimeLogistics);
  }, [setValue, productionTime, deliveryTimeLogistics]);

  useEffect(() => {
    setValue("parameters.paymentBeforeShipment", 100 - prepayment);
  }, [setValue, prepayment]);

  useEffect(() => {
    setValue("parameters.paymentBeforeShipmentSale", 100 - prepaymentSale);
  }, [setValue, prepaymentSale]);

  //needs
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

  return (
    <>
      <div className="flex gap-8 mb-6">
        <div className="flex flex-col gap-8 w-[400px]">
          <h2 className="font-bold">Закупка:</h2>
          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.purchase || 0}
            label={"Закупка, руб"}
            nameInput="purchase"
            control={control}
          />
          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.productionTime || 0}
            label={"Срок производсва, мес"}
            nameInput="productionTime"
            control={control}
          />

          <h2 className="py-2 font-bold">Условия оплаты:</h2>
          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.prepayment || 0}
            label={"Предоплата, %"}
            maxValue={100}
            nameInput="prepayment"
            control={control}
          />
          <FormattedInput
            isAgreed={isAgreed}
            disabled
            defaultValue={watch("parameters.paymentBeforeShipment") || 0}
            label={"Перед отгрузкой, %"}
            maxValue={100}
            nameInput="paymentBeforeShipment"
            control={control}
          />
        </div>
        <div className="flex flex-col gap-8 px-2 w-[400px] bg-[#ffe3ed]">
          <h2 className="font-bold">Продажа:</h2>
          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.salesWithVAT || 0}
            nameInput="salesWithVAT"
            label={"Продажа с НДС, РУБ"}
            control={control}
          />
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.deliveryTime}
            value={new Intl.NumberFormat("ru-RU").format(
              watch("parameters.deliveryTime")
            )}
            label={"Срок поставки, мес"}
          />

          <h2 className="py-2 font-bold">Условия оплаты:</h2>
          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.prepaymentSale || 0}
            label={"Предоплата, %"}
            maxValue={100}
            nameInput="prepaymentSale"
            control={control}
          />
          <FormattedInput
            isAgreed={isAgreed}
            disabled
            defaultValue={watch("parameters.paymentBeforeShipmentSale") || 0}
            label={"Перед отгрузкой, %"}
            maxValue={100}
            nameInput="paymentBeforeShipmentSale"
            control={control}
          />
        </div>
      </div>
      <div className="flex gap-8 mb-6">
        <div className="flex flex-col gap-8 w-[400px] bg-[#e9f5f7] mt-2 p-2">
          <h2 className="py-2 font-bold">Логистика:</h2>
          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.delivery || 0}
            label={"Доставка, РУБ"}
            nameInput="delivery"
            control={control}
          />
          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.deliveryTimeLogistics || 0}
            label={"Срок поставки, мес"}
            nameInput="deliveryTimeLogistics"
            control={control}
          />
          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.deferralPaymentByCustomer || 0}
            label={"Отсрочка оплаты заказчика"}
            nameInput="deferralPaymentByCustomer"
            control={control}
          />
        </div>
        <div className="flex flex-col gap-8 w-[400px] bg-[#e9f5f7] mt-2 p-2">
          <h2 className="py-2 font-bold">Прочие расходы:</h2>
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.operationalActivities}
            label={"Операционная деятельность (4%), РУБ"}
            value={new Intl.NumberFormat("ru-RU").format(
              watch("parameters.operationalActivities")
            )}
          />
          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.additionalExpensesPercent || 0}
            label={"Дополнительные расходы, %"}
            maxValue={100}
            nameInput="additionalExpensesPercent"
            control={control}
          />

          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.additionalExpenses}
            label={"Дополнительные расходы, РУБ"}
            value={new Intl.NumberFormat("ru-RU").format(
              watch("parameters.additionalExpenses")
            )}
          />

          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.otherUnplannedExpenses || 0}
            label={"Прочие незапланированные расходы"}
            nameInput="otherUnplannedExpenses"
            control={control}
          />

          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.totalOtherExpenses}
            value={new Intl.NumberFormat("ru-RU").format(
              watch("parameters.totalOtherExpenses")
            )}
            label={"Итого прочие расходы"}
          />
        </div>
      </div>
      <div className="flex gap-8 mb-6">
        <div className="flex flex-col gap-8 w-[400px] bg-[#e9f5f7] mt-2 p-2">
          <h2 className="py-2 font-bold">Инвестиции:</h2>
          <FormattedInput
            isAgreed={isAgreed}
            defaultValue={order?.parameters?.costOfMoney || 0}
            label={"Стоимость денег, %"}
            maxValue={15}
            nameInput="costOfMoney"
            control={control}
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
            onButtonClick={() => {
              const currentValues = getValues();
              const filteredValues: Partial<Order> = Object.fromEntries(
                Object.entries(currentValues).filter(
                  ([key]) => !keysToRemove.includes(key)
                )
              );

              calculateMutation(filteredValues as Order);
            }}
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
            value={new Intl.NumberFormat("ru-RU").format(
              order?.parameters?.companyProfit
            )}
            label={"Прибыль компании, РУБ"}
          />

          <TextField
            variant="outlined"
            disabled
            value={new Intl.NumberFormat("ru-RU").format(
              order?.parameters?.companyProfitMinusVAT
            )}
            label={"Прибыль компании за вычетом НДС, РУБ"}
          />

          <TextField
            variant="outlined"
            disabled
            value={new Intl.NumberFormat("ru-RU").format(
              order?.parameters?.companyProfitMinusTAX
            )}
            label={"Прибыль компании за вычетом налога на прибыль, РУБ"}
          />

          <h2 className="font-bold">Рентабельность проекта, %</h2>
          <TextField
            variant="outlined"
            disabled
            className={clsx({
              "bg-rose-300": order?.parameters?.projectProfitability < 20,
              "bg-green-500": order?.parameters?.projectProfitability > 20,
            })}
            value={Math.round(order?.parameters?.projectProfitability)}
            // label={"Рентабельность проекта, %"}
            type="number"
          />

          <h2 className="font-bold">% доли *** в прибыли, %</h2>
          <TextField
            variant="outlined"
            disabled
            className={clsx({
              "bg-rose-300": order?.parameters?.percentShareInProfit < 25,
              "bg-green-500": order?.parameters?.percentShareInProfit > 25,
            })}
            value={Math.round(order?.parameters?.percentShareInProfit)}
            type="number"
          />
        </div>
      )}
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
