import {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { Inputs } from "../../OrderDetail";
import { TextField } from "@mui/material";
import { Order } from "../../../../../shared/types";
import { useEffect } from "react";
import { OPERATIONAL_ACTIVITIES } from "../../constants";

type Props = {
  register: UseFormRegister<Inputs>;
  errors: FieldErrors<Inputs>;
  order?: Order;
  setValue: UseFormSetValue<Inputs>;
  watch: UseFormWatch<Inputs>;
};

export const RubToRub: React.FC<Props> = ({
  register,
  errors,
  order,
  setValue,
  watch,
}) => {
  console.log(register);

  const salesWithVAT = watch("parameters.salesWithVAT");
  const operationalActivities = watch("parameters.operationalActivities") || 0;
  const additionalExpenses = watch("parameters.additionalExpenses") || 0;
  const otherUnplannedExpenses =
    watch("parameters.otherUnplannedExpenses") || 0;

  useEffect(() => {
    setValue(
      "parameters.operationalActivities",
      salesWithVAT * OPERATIONAL_ACTIVITIES
    );
  }, [setValue, salesWithVAT]);

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
          <TextField
            variant="outlined"
            required
            defaultValue={order?.parameters?.purchase}
            label={"Закупка, РУБ"}
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
            defaultValue={order?.parameters?.salesWithVAT}
            label={"Продажа с НДС"}
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
          <h2 className="py-2 font-bold">Логистика:</h2>
          <TextField
            variant="outlined"
            required
            defaultValue={order?.parameters?.delivery}
            label={"Доставка, РУБ"}
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
        </div>
        <div className="flex flex-col gap-8 w-[400px] bg-[#e9f5f7] mt-2 p-2">
          <h2 className="py-2 font-bold">Прочие расходы:</h2>
          <TextField
            variant="outlined"
            disabled
            defaultValue={order?.parameters?.operationalActivities}
            label={"Операционная деятельность, РУБ"}
            type="number"
            value={watch("parameters.operationalActivities")}
          />
          <TextField
            variant="outlined"
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
