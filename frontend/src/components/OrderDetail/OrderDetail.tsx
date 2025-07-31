import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { Customer, Item, Order, User } from "../../../shared/types";
import { useAuthStore } from "../../../shared/stores/auth";
import { Button } from "../Button";
import { appToast } from "../AppToast/components/lib/appToast";
import { api } from "../../../shared/api/api";
import { useTranslations } from "next-intl";
import { useJwtToken } from "../../../shared/hooks/useJwtToken";
import clsx from "clsx";

type Props = {
  id: number;
};

type Inputs = Order & {
  customerId: number;
  ownerId: number;
  equipmentTypeId: number;
};

export const OrderDetail: React.FC<Props> = ({ id }) => {
  const t = useTranslations("OrderDetail");
  const isEdit = id !== 0;
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [customer, setCustomer] = React.useState<number>(0);
  const [owner, setOwner] = React.useState<number>(0);
  const router = useRouter();
  const { sub } = useJwtToken();
  const isAdmin = Number(sub) === 1;

  const getCustomers = () => api.getAllCustomersRequest(token);
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery<
    Customer[]
  >({ queryKey: ["customer"], queryFn: getCustomers });

  const getUsers = () => api.getAllUsersRequest(token);
  const { data: owners = [], isLoading: isLoadingOwners } = useQuery<User[]>({
    queryKey: ["user"],
    queryFn: getUsers,
    enabled: isAdmin,
  });

  const getOrderById = () => api.getOrderByIdRequest(id, token);
  const getQueryKey = (id: number) => ["order"].concat(id.toString());

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: getQueryKey(id),
    queryFn: getOrderById,
    enabled: id !== 0,
  });
  const [formData, setFormData] = React.useState<Record<number, Item>>({});

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      documentationSheet: order?.documentationSheet,
    },
  });

  const updateOrderFunc = (input: Inputs) =>
    api.updateOrderRequest(input, token);
  const createOrderFunc = (input: Inputs) =>
    api.createOrderRequest(input, token);
  const deleteFunc = () => api.deleteOrderRequest(id, token);

  const { mutateAsync: mutation, isPending } = useMutation({
    mutationFn: isEdit ? updateOrderFunc : createOrderFunc,
    onSuccess: () => {
      appToast.success(isEdit ? t("updated") : t("added"));
      queryClient.invalidateQueries({ queryKey: getQueryKey(id) });
    },
    onError: () => {
      appToast.error(t("error"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFunc,
    onSuccess: () => {
      appToast.success("deleted");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      router.back();
    },
    onError: () => {
      appToast.error(t("error"));
    },
  });

  const handleChangeCustomer = (event: SelectChangeEvent) => {
    setCustomer(+event.target.value as number);
    setValue("customerId", +event.target.value as number);
  };

  const handleChangeOwner = (event: SelectChangeEvent) => {
    setOwner(+event.target.value as number);
    setValue("ownerId", +event.target.value as number);
  };

  const onDeleteClick = (event: React.MouseEvent) => {
    event.preventDefault();
    deleteMutation.mutate();
  };

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    mutation({
      ...data,
      ...(Boolean(order?.owner.id) && { ownerId: owner }),
    }).then(async () => {
      router.back();
    });
  };

  useEffect(() => {
    if (!order) return;
    Object.keys(order).forEach((key) => {
      if (key in order) {
        setValue(key as keyof Inputs, order[key as keyof Order]);
      }
    });
    if (order.customer) {
      setCustomer(order.customer.id);
      setValue("customerId", order.customer.id);
    }

    if (order.owner) {
      setOwner(order.owner.id);
      setValue("ownerId", order.owner.id);
    }
    if (order.items) {
      setFormData(
        order.items.reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {} as Record<number, (typeof order.items)[number]>)
      );
    }
  }, [order, setValue]);

  return (
    <>
      {!isLoading && (
        <section className="container px-40 rounded-lg pt-4 mt-[60px]">
          <div className="flex mt-8 justify-between gap-4">
            <h2 className="text-xl">{t(isEdit ? "edit" : "add")}</h2>
            <Button
              onButtonClick={() => router.back()}
              title={t("back")}
            ></Button>
          </div>

          {
            <div className="flex justify-between">
              <form
                id="createItemForm"
                name="createItemForm"
                onSubmit={handleSubmit(onSubmit)}
                className="md:w-[50%] py-4 flex flex-col md:gap-6 gap-4"
              >
                <TextField
                  variant="outlined"
                  label={t("contractNumber")}
                  {...register("contractNumber", { required: true })}
                />
                {errors.contractNumber && (
                  <span className="text-red">{t("required")}</span>
                )}

                <TextField
                  variant="outlined"
                  label={t("complectName")}
                  {...register("complectName", { required: true })}
                />
                {errors.complectName && (
                  <span className="text-red">{t("required")}</span>
                )}
                <FormControl fullWidth required>
                  <InputLabel id="demo-simple-select-label">
                    {t("customerName")}
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={(customer ?? 0).toString()}
                    disabled={isLoadingCustomers}
                    label={t("customerName")}
                    onChange={handleChangeCustomer}
                  >
                    <MenuItem value="0">{t("not_selected")}</MenuItem>
                    {customers.map((customer, i) => (
                      <MenuItem key={i} value={customer.id}>
                        {customer.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {/* <FormControl fullWidth required>
                  <InputLabel id="demo-simple-select-label">
                    {t("equipmentType")}
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={(equipmentType ?? 0).toString()}
                    disabled={isLoadingEquipmentType}
                    label={t("equipmentType")}
                    onChange={handleChangeEquipmentType}
                  >
                    <MenuItem value="0">{"Не выбрано"}</MenuItem>
                    {equipmentTypes.map((type, i) => (
                      <MenuItem key={i} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl> */}
                <FormControl
                  fullWidth
                  className={clsx({ "!hidden": !isAdmin })}
                >
                  <InputLabel id="demo-simple-select-label">
                    {t("owner")}
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={(owner ?? 0).toString()}
                    disabled={isLoadingOwners}
                    label={t("owner")}
                    onChange={handleChangeOwner}
                  >
                    <MenuItem value="0">{t("not_selected")}</MenuItem>
                    {owners.map((owner, i) => (
                      <MenuItem key={i} value={owner.id}>
                        {owner.about}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <div className="flex gap-4">
                  <Button
                    disabled={isPending}
                    title={t("save")}
                    type="submit"
                  />

                  {isAdmin && (
                    <Button
                      title={t("delete")}
                      onButtonClick={onDeleteClick}
                      type="button"
                    />
                  )}
                </div>
                <div className="flex flex-col">
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={order?.documentationSheet || false}
                        onChange={(e) =>
                          setValue("documentationSheet", e.target.checked)
                        }
                      />
                    }
                    label={t("documentation_sheet")}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={order?.installationDrawings || false}
                        onChange={(e) =>
                          setValue("installationDrawings", e.target.checked)
                        }
                      />
                    }
                    label={t("installation_drawings")}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={order?.assemblyDrawing || false}
                        onChange={(e) =>
                          setValue("assemblyDrawing", e.target.checked)
                        }
                      />
                    }
                    label={t("assembly_drawing")}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={order?.agreementProtocol || false}
                        onChange={(e) =>
                          setValue("agreementProtocol", e.target.checked)
                        }
                      />
                    }
                    label={t("agreement_protocol")}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={
                          order?.installationInstructions || false
                        }
                        onChange={(e) =>
                          setValue("installationInstructions", e.target.checked)
                        }
                      />
                    }
                    label={t("installation_instructions")}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={order?.qualityPlan || false}
                        onChange={(e) =>
                          setValue("qualityPlan", e.target.checked)
                        }
                      />
                    }
                    label={t("quality_plan")}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={order?.materialsCertificate || false}
                        onChange={(e) =>
                          setValue("materialsCertificate", e.target.checked)
                        }
                      />
                    }
                    label={t("materials_certificate")}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={order?.declarationOfTRTC || false}
                        onChange={(e) =>
                          setValue("declarationOfTRTC", e.target.checked)
                        }
                      />
                    }
                    label={t("declaration_of_trtc")}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={
                          order?.presenceOfCustomerDuringTesting || false
                        }
                        onChange={(e) =>
                          setValue(
                            "presenceOfCustomerDuringTesting",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label={t("presence_of_customer_during_testing")}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={
                          order?.gasInspectionHighPressure || false
                        }
                        onChange={(e) =>
                          setValue(
                            "gasInspectionHighPressure",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label={t("gas_inspection_high_pressure")}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={order?.thirdSideInspection || false}
                        onChange={(e) =>
                          setValue("thirdSideInspection", e.target.checked)
                        }
                      />
                    }
                    label={t("third_side_inspection")}
                  />
                </div>
              </form>
            </div>
          }

          <div className="h-[32px]"></div>
        </section>
      )}
    </>
  );
};
