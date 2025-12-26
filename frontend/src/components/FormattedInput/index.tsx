import { TextField } from "@mui/material";
import { Controller, Control } from "react-hook-form";
import { useEffect, useState } from "react";
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
  onlyInteger?: boolean;
};

/**
 * Поле ввода с форматированием:
 * - по умолчанию: 1 знак после запятой
 * - onlyInteger: только целые числа
 */
export const FormattedInput: React.FC<Props> = ({
  isAgreed,
  control,
  nameInput,
  label,
  disabled,
  defaultValue,
  maxValue,
  onlyInteger = false,
}) => {
  return (
    <Controller
      name={`parameters.${nameInput}`}
      control={control}
      defaultValue={defaultValue}
      rules={{ required: "Поле обязательно" }}
      render={({ field, fieldState }) => (
        <FormattedField
          value={field.value || 0}
          onChange={field.onChange}
          label={label}
          disabled={isAgreed || disabled}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          maxValue={maxValue}
          onlyInteger={onlyInteger}
        />
      )}
    />
  );
};

type FormattedFieldProps = {
  value: string | number | undefined;
  onChange: (value: number | "") => void;
  label: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  maxValue?: number;
  onlyInteger: boolean;
};

const FormattedField: React.FC<FormattedFieldProps> = ({
  value,
  onChange,
  label,
  disabled,
  error,
  helperText,
  maxValue,
  onlyInteger,
}) => {
  const [inputValue, setInputValue] = useState<string>("");

  /**
   * Синхронизация строки с числом из react-hook-form
   */
  useEffect(() => {
    if (typeof value === "number" && !isNaN(value)) {
      setInputValue(
        new Intl.NumberFormat("ru-RU", {
          maximumFractionDigits: onlyInteger ? 0 : 1,
        }).format(value)
      );
    }
  }, [value, onlyInteger]);

  /**
   * Обработка ввода
   */
  const handleChange = (val: string) => {
    let raw = val.replace(/\s/g, "");

    // заменяем запятую на точку для парсинга
    if (!onlyInteger) {
      raw = raw.replace(",", ".");
    }

    // допустимые состояния:
    // "", "12", "12.", "12.3"
    const validPattern = onlyInteger ? /^\d*$/ : /^\d*(?:[.,]\d?)?$/;

    if (!validPattern.test(raw)) return;

    setInputValue(val);

    const num = onlyInteger ? parseInt(raw, 10) : parseFloat(raw);

    if (!isNaN(num)) {
      if (typeof maxValue === "number" && num > maxValue) {
        onChange(maxValue);
      } else {
        onChange(onlyInteger ? num : Math.round(num * 10) / 10);
      }
    }
  };

  /**
   * Форматируем значение при потере фокуса
   */
  const handleBlur = () => {
    if (typeof value === "number" && !isNaN(value)) {
      setInputValue(
        new Intl.NumberFormat("ru-RU", {
          maximumFractionDigits: onlyInteger ? 0 : 1,
        }).format(value)
      );
    }
  };

  return (
    <TextField
      value={inputValue}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      label={label}
      disabled={disabled}
      error={error}
      helperText={helperText}
      required
      inputProps={{
        inputMode: onlyInteger ? "numeric" : "decimal",
        min: 0,
      }}
    />
  );
};
