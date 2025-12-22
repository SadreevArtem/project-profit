import React from "react";
import { useAuthStore } from "../../../shared/stores/auth";
import { useQuery } from "@tanstack/react-query";
import { Order, OrderStatus } from "../../../shared/types";
import { api } from "../../../shared/api/api";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "../Button";
import { useTranslations } from "next-intl";
import { formatDate } from "../../../shared/lib/formatDate";
import clsx from "clsx";

export const Orders = () => {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const getOrders = () => api.getAllOrdersRequest(token);
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: getOrders,
  });
  const t = useTranslations("Orders");
  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <div className="flex mb-2">
            <Link className="ml-auto" href="/orders/0">
              <Button className=" w-auto px-6" title={t("add")} />
            </Link>
          </div>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("ID")}</TableCell>
                  <TableCell>{t("customerName")}</TableCell>
                  <TableCell>{t("contractNumber")}</TableCell>
                  <TableCell>{t("status")}</TableCell>
                  <TableCell>{t("complectName")}</TableCell>
                  <TableCell>{t("owner")}</TableCell>
                  <TableCell>{t("created")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders?.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => router.push(`/orders/${row.id}`)}
                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.customer?.name}</TableCell>
                    <TableCell>{row.contractNumber}</TableCell>
                    <TableCell
                      className={clsx({
                        "!bg-orange-500 !text-white":
                          row.orderStatus === OrderStatus.UNDER_APPROVAL,
                        "!bg-green-500": row.orderStatus === OrderStatus.AGREED,
                        "!bg-slate-400": row.orderStatus === OrderStatus.DRAFT,
                        "!bg-pink-300":
                          row.orderStatus === OrderStatus.REJECTED,
                      })}
                    >
                      {t(row.orderStatus)}
                    </TableCell>
                    <TableCell>{row.complectName}</TableCell>
                    <TableCell>{row.owner?.about}</TableCell>
                    <TableCell>{formatDate(row.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </>
  );
};
