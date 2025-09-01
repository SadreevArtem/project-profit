import { TextField } from "@mui/material";
import { useState } from "react";
import { Parameters } from "../../../shared/types";
import { UseFormSetValue } from "react-hook-form";
import { Inputs } from "../OrderDetail/OrderDetail";

type Props = {
  isAgreed: boolean;
  setValue: UseFormSetValue<Inputs>;
  nameInput: keyof Parameters;
  label: string;
  defaultValue: number;
};

export const FormattedInput: React.FC<Props> = ({
  isAgreed,
  setValue,
  nameInput,
  label,
  defaultValue,
}) => {
  const [displayValue, setDisplayValue] = useState(
    defaultValue ? new Intl.NumberFormat("ru-RU").format(defaultValue) : ""
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.replace(/\s/g, ""); // убираем пробелы
    const num = parseInt(raw, 10);

    if (!isNaN(num)) {
      setDisplayValue(new Intl.NumberFormat("ru-RU").format(num));
      setValue(`parameters.${nameInput}`, num);
    } else {
      setDisplayValue("");
      setValue(`parameters.${nameInput}`, 0);
    }
  };

  return (
    <TextField
      variant="outlined"
      required
      defaultValue={defaultValue}
      disabled={isAgreed}
      value={displayValue}
      label={label}
      onChange={handleChange}
      inputProps={{ inputMode: "numeric", pattern: "[0-9]*", min: 0 }} // только цифры
    />
  );
};
