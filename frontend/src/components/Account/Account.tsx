import { TextField } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { User } from "../../../shared/types";
import { useAuthStore } from "../../../shared/stores/auth";
import { Button } from "../Button";
import { appToast } from "../AppToast/components/lib/appToast";
import { api } from "../../../shared/api/api";
import { useTranslations } from "next-intl";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";
import { useJwtToken } from "../../../shared/hooks/useJwtToken";
import Link from "next/link";

type Props = {
  id: number;
};
type Inputs = User;

export const Account: React.FC<Props> = ({ id }) => {
  const token = useAuthStore((state) => state.token);
  const t = useTranslations("UserDetail");
  const queryClient = useQueryClient();
  // const router = useRouter();
  const { endContract } = useJwtToken();
  const isAccess = Boolean(endContract) && dayjs().isBefore(endContract);
  const getUserById = () => api.getUserByIdAdminRequest(id, token);
  const getQueryKey = (id: number) => ["user"].concat(id.toString());
  // const uploadImageFunc = (file: File) => api.uploadImage(file);

  const { data: user, isLoading } = useQuery<User>({
    queryKey: getQueryKey(id),
    queryFn: getUserById,
  });
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<Inputs>();

  const updateUserFunc = (input: User) => api.updateUserRequest(input, token);
  // const uploadImageMutation = useMutation({
  //   mutationFn: uploadImageFunc,
  //   onSuccess: (res: FilesModel) => {
  //     appToast.success("Успешно загружено");
  //     setValue("avatar", res.path);
  //   },
  // });
  // const uploadImageHandler: (image?: File | null) => void = (image) => {
  //   uploadImageMutation.mutate(image as File);
  // };
  // const deleteImageHandler = async () => {
  //   setValue("avatar", "");
  // };
  const mutation = useMutation({
    mutationFn: updateUserFunc,
    onSuccess: () => {
      appToast.success("Успешно изменено");
      queryClient.invalidateQueries();
    },
    onError: () => {
      appToast.error("Произошла ошибка");
    },
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const prepareData = {
      ...data,
    };
    if (data.password === "") delete prepareData.password;
    mutation.mutate({
      ...prepareData,
    });
  };

  useEffect(() => {
    if (!user) return;
    Object.keys(user).forEach((key) => {
      if (key in user) {
        setValue(key as keyof User, user[key as keyof User] as string);
      }
    });
  }, [user, setValue]);
  return (
    <>
      {!isLoading && (
        <section className="container px-40 rounded-lg pt-4 mt-[60px]">
          <div className="flex mt-8 justify-between gap-4">
            <h2 className="text-xl">{t("account")}</h2>
            {/* <Button
              onButtonClick={() => router.push("/")}
              title={t("back")}
            ></Button> */}
          </div>
          <div className="flex justify-between gap-8">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="md:w-[80%] py-4 flex flex-col md:gap-6 gap-4"
            >
              <TextField
                variant="outlined"
                label={t("username")}
                {...register("username")}
              />
              {errors.username && (
                <span className="text-red-500">{t("required")}</span>
              )}
              <TextField
                variant="outlined"
                label={t("aboutUser")}
                {...register("about")}
              />
              <TextField
                variant="outlined"
                label={t("adressOne")}
                {...register("adressOneLine")}
              />
              <TextField
                variant="outlined"
                label={t("adressTwo")}
                {...register("adressTwoLine")}
              />
              <TextField
                variant="outlined"
                label={t("phone")}
                {...register("phone")}
              />
              <TextField
                variant="outlined"
                label={t("email")}
                {...register("email")}
              />
              <TextField
                variant="outlined"
                label={t("password")}
                {...register("password")}
              />
              <Controller
                name="endContract"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label={t("endContract")}
                    value={dayjs(field.value)}
                    format="DD.MM.YYYY"
                    disabled
                    onChange={(date) => field.onChange(date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                        error: !!errors.endContract,
                        helperText: errors.endContract ? t("required") : "",
                      },
                    }}
                  />
                )}
              />

              {/* <Controller
                  name="published"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <FormControlLabel
                      control={<Switch checked={value} />}
                      label="Опубликовано"
                      onChange={onChange}
                      value={value}
                    />
                  )}
                /> */}

              <div className="flex gap-4">
                <Button title={t("save")} type="submit" />
              </div>
            </form>
            {/* <div className="flex w-full flex-col">
              <Controller
                control={control}
                name="avatar"
                render={({ field }) => (
                  <ImageInput
                    addAlert={() => console.log("alert")}
                    url={field?.value ?? ""}
                    value={{ path: field.value }}
                    onUpdate={field.onChange}
                    withPreview={false}
                    onChange={uploadImageHandler}
                    onDelete={deleteImageHandler}
                  />
                )}
              />
            </div> */}
          </div>
          {!isAccess && (
            <div>
              <p className="inline-block text-primary mr-5">
                По вопросам получения доступа свяжитесь с нами
              </p>
              <Link className="text-link" href={"mailto:info@ppvb.pro"}>
                info@ppvb.pro
              </Link>
            </div>
          )}
        </section>
      )}
    </>
  );
};
