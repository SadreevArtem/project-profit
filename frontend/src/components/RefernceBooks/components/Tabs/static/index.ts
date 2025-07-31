import { References } from "@/components/RefernceBooks/types";

export const reference: {
  id: number;
  categoryName: References;
  value: { [key: string]: string };
}[] = [
  {
    id: 1,
    categoryName: "customers",
    value: { ru: "Заказчики", en: "Сustomers" },
  },
  // {
  //   id: 2,
  //   categoryName: "equipmentType",
  //   value: { ru: "Вид оборудования", en: "Equipment Type" },
  // }
];
