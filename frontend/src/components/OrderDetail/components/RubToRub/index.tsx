import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Inputs } from "../../OrderDetail";
import { TextField } from "@mui/material";
import { Order } from "../../../../../shared/types";

type Props = {
  register: UseFormRegister<Inputs>;
  errors: FieldErrors<Inputs>;
  order?: Order;
  setValue: UseFormSetValue<Inputs>;
};

export const RubToRub: React.FC<Props> = ({
  register,
  errors,
  order,
  setValue,
}) => {
  console.log(register);

  return (
    <>
      <h2 className="pb-6 font-bold">Закупка:</h2>
      <div className="flex flex-col gap-8 max-w-[400px]">
        <TextField
          variant="outlined"
          required
          defaultValue={order?.purchase}
          label={"Закупка, РУБ"}
          type="number"
          onChange={(event) => {
            setValue("purchase", +event.target.value);
          }}
        />
        {errors.purchase && <span className="text-red">{"required"}</span>}
        <TextField
          variant="outlined"
          required
          defaultValue={order?.productionTime}
          label={"Срок производсва, мес"}
          type="number"
          onChange={(event) => {
            setValue("productionTime", +event.target.value);
          }}
        />
        {errors.productionTime && (
          <span className="text-red">{"required"}</span>
        )}
      </div>
      <h2 className="py-6 font-bold">Условия оплаты:</h2>
      <div className="flex flex-col gap-8 max-w-[400px]">
        <TextField
          variant="outlined"
          required
          defaultValue={order?.prepayment}
          label={"Предоплата, %"}
          type="number"
          onChange={(event) => {
            setValue("prepayment", +event.target.value);
          }}
        />
        {errors.prepayment && <span className="text-red">{"required"}</span>}
        <TextField
          variant="outlined"
          required
          defaultValue={order?.paymentBeforeShipment}
          label={"Перед отгрузкой, %"}
          type="number"
          onChange={(event) => {
            setValue("paymentBeforeShipment", +event.target.value);
          }}
        />
        {errors.paymentBeforeShipment && (
          <span className="text-red">{"required"}</span>
        )}
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
