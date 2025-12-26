import { useQuery } from "@tanstack/react-query";

const CBR_URL = "https://www.cbr-xml-daily.ru/daily_json.js";

export const useCbrRates = () => {
  return useQuery({
    queryKey: ["cbr-rates"],
    queryFn: async ({ signal }) => {
      const response = await fetch(CBR_URL, { signal, cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      return {
        date: data?.Date,
        rates: {
          USD: data?.Valute?.USD?.Value,
          EUR: data?.Valute?.EUR?.Value,
          GBP: data?.Valute?.GBP?.Value,
          CNY: data?.Valute?.CNY?.Value,
        },
      };
    },
    // Настройки для оптимизации (по желанию):
    staleTime: 0, // Курсы ЦБ меняются раз в сутки, можно кэшировать надолго
  });
};
