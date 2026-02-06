"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { resolveResponse } from "@/service/config.service";
import { TLogin, TResetPassword } from "@/types/auth/auth.type";
import { useAtom } from "jotai";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form"
import { maskCPF, maskPhone } from "@/utils/mask.util";
import { api } from "@/service/api.service";
import { Logo } from "@/components/logo/Logo";
import Label from "@/components/form/LabelForm";
import Input from "@/components/form/input/Input";
import Button from "@/ui/Button";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { toast } from "react-toastify";

export default function ResetPasswordForm() {
  const [__, setIsLoading] = useAtom(loadingAtom);

  const [type, setType] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [id, setId] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const router = useRouter();

  const { register, handleSubmit, formState: { errors }} = useForm<TResetPassword>();
  
  const requestReset: SubmitHandler<TResetPassword> = async (body: TResetPassword) => {
    if(!body.email) return toast.warn('E-mail é obrigatório', {theme: 'colored'});
    try {
      setIsLoading(true);
      const {data} = await api.put(`/auth/request-forgot-password`, {...body, device: "app", type});
      const result = data.result.data;
      console.log(result)
      setCode(result.codeAccess);
      setId(result.id);
      toast.success('Foi enviado um código para o seu e-mail', {theme: 'colored'})
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const reset: SubmitHandler<TResetPassword> = async (body: TResetPassword) => {
    try {
      setIsLoading(true);
      const {data} = await api.put(`/auth/reset-password/app`, {...body, device: "app", type, id});
      const result = data.result;
      resolveResponse({status: 200, ...result});
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="p-6">
          <div className="mb-5 sm:mb-8 flex justify-center">
            <Logo className="h-42" />
          </div>

          {
            code ?
            <form onSubmit={handleSubmit(reset)}>
              <div className="space-y-6">
                <div>
                  <Label label="Código" />
                  <Input maxLength={6} {...register("codeAccess")} />
                </div>
                
                <div>
                  <Label label="Senha" />
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} {...register("password")} />
                    <span onClick={() => setShowPassword(!showPassword)} className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2" >
                      {showPassword ? (
                        <GoEye className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <GoEyeClosed className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label label="Confirmar Senha" />
                  <div className="relative">
                    <Input type={showNewPassword ? "text" : "password"} {...register("newPassword")} />
                    <span onClick={() => setShowNewPassword(!showNewPassword)} className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2" >
                      {showNewPassword ? (
                        <GoEye className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <GoEyeClosed className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">                  
                  <Link href="/" className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
                    Fazer login
                  </Link>
                </div>
                <div>
                  <Button className="w-full" size="sm">
                    Resetar senha
                  </Button>
                </div>
              </div>
            </form>
            :
            <form onSubmit={handleSubmit(requestReset)}>
              <div className="space-y-6">
                <div>
                  <Label label="E-mail" />
                  <Input type="email" {...register("email")} />
                </div>
                <div className="flex items-center justify-between">                  
                  <Link href="/" className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
                    Fazer login
                  </Link>
                </div>
                <div>
                  <Button className="w-full" size="sm">
                    Verificar
                  </Button>
                </div>
              </div>
            </form>
          }
        </div>
      </div>
    </div>
  );
}
