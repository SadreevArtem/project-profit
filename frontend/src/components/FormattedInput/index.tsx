import { TextField } from "@mui/material";
import { Controller, Control } from "react-hook-form";
import { Parameters } from "../../../shared/types";
import { Inputs } from "../OrderDetail/OrderDetail";

type Props = {
  isAgreed: boolean;
  control: Control<Inputs>;
  nameInput: keyof Parameters;
  label: string;
  disabled?: boolean;
  defaultValue: number;
  maxValue?: number;
};

export const FormattedInput: React.FC<Props> = ({
  isAgreed,
  control,
  nameInput,
  label,
  disabled,
  defaultValue,
  maxValue,
}) => {
  return (
    <Controller
      name={`parameters.${nameInput}`}
      control={control}
      rules={{ required: "Поле обязательно" }}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => {
        const numericValue =
          typeof field.value === "number"
            ? field.value
            : parseInt(field.value || "0", 10);

        const displayValue =
          !isNaN(numericValue) && numericValue >= 0
            ? new Intl.NumberFormat("ru-RU").format(numericValue)
            : "";

        return (
          <TextField
            {...field}
            value={displayValue}
            disabled={isAgreed || disabled}
            label={label}
            required
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            onChange={(e) => {
              const raw = e.target.value.replace(/\s/g, "");
              const num = parseInt(raw, 10);
              if (isNaN(num)) {
                field.onChange("");
                return;
              }

              if (typeof maxValue === "number" && num > maxValue) {
                field.onChange(maxValue);
                return;
              }

              field.onChange(num);
            }}
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
              min: 0,
              ...(typeof maxValue === "number" ? { max: maxValue } : {}),
            }}
          />
        );
      }}
    />
  );
};
