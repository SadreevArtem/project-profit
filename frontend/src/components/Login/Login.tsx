import React, { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { PasswordTextField } from "../PasswordTextField/PasswordTextField";
import { AppTextField } from "../AppTextField/AppTextField";
import { useAuthStore } from "../../../shared/stores/auth";
import { api } from "../../../shared/api/api";
import Image from "next/image";
import { getErrorMessage } from "../../../shared/lib/getError";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "./LocaleSwitcher/LocaleSwitcher";
import Link from "next/link";

type Inputs = {
  username: string;
  password: string;
  email?: string;
};

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Inputs>();
  const auth = useAuthStore((state) => state.auth);
  const t = useTranslations("Login");
  const signInFunction = (data: Inputs) => api.signInRequest(data);
  const signUpFunction = (data: Inputs) => api.signUpRequest(data);
  const { mutate: mutation, isPending } = useMutation({
    mutationFn: isSignUp ? signUpFunction : signInFunction,
    onSuccess: async (data) => {
      const token = data.access_token;

      if (!token) {
        throw new Error();
      }
      auth(token);
    },
    onError: () => window.alert("Ошибка авторизации"),
  });
  const getError = getErrorMessage(errors);
  const onSubmit: SubmitHandler<Inputs> = (data) => mutation(data as Inputs);

  return (
    <>
      <div className="h-[100vh] flex justify-center items-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="md:w-[30%] py-4 flex flex-col md:gap-6 gap-4"
        >
          <LocaleSwitcher className="" />
          <div className="flex items-center justify-between">
            <Image
              src="/logo-max.png"
              alt="logo"
              width={220}
              height={100}
              className="self-center"
            />
            <h2 className="text-2xl font-bold text-primary">PROJECT PROFIT</h2>
          </div>
          {isSignUp ? (
            <div className="flex gap-4 text-primary">
              <p className="inline-block">Уже есть аккаунт?</p>
              <p
                onClick={() => setIsSignUp((prev) => !prev)}
                className="inline-block underline hover:text-blue-800 hover:cursor-pointer"
              >
                Войдите
              </p>
            </div>
          ) : (
            <div className="flex gap-4 text-primary">
              <p className="inline-block">Нет аккаунта?</p>
              <p
                onClick={() => setIsSignUp((prev) => !prev)}
                className="inline-block underline hover:text-blue-800 hover:cursor-pointer"
              >
                Зарегистрируйтесь
              </p>
            </div>
          )}
          <Controller
            name="username"
            rules={{ required: true }}
            control={control}
            render={({ field }) => (
              <AppTextField tag="input" label={t("name")} {...field} />
            )}
          />
          {errors.username && (
            <span className="text-red-500">{t("requiredName")}</span>
          )}
          {isSignUp && (
            <>
              <Controller
                name="email"
                rules={{ required: true }}
                control={control}
                render={({ field }) => (
                  <AppTextField tag="input" label={t("email")} {...field} />
                )}
              />
              {errors.username && (
                <span className="text-red-500">{t("requiredName")}</span>
              )}
            </>
          )}

          <Controller
            name="password"
            rules={{ required: true }}
            control={control}
            render={({ field }) => (
              <PasswordTextField
                tag="input"
                label={t("password")}
                disabled={isPending}
                error={getError("password")}
                {...field}
              />
            )}
          />
          {errors.password && (
            <span className="text-red-500">{t("requiredPassword")}</span>
          )}
          <button className="button" type="submit">
            {t(isSignUp ? "signUp" : "signIn")}
          </button>
          <div>
            <p className="inline-block text-primary mr-5">
              Есть вопросы? свяжитесь с нами
            </p>
            <Link className="text-link" href={"mailto:info@ppvb.pro"}>
              info@ppvb.pro
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};
