"use client";

import Input from "@/components/form/input/Input";
import Label from "@/components/form/LabelForm";
import { Logo } from "@/components/logo/Logo";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { resolveResponse } from "@/service/config.service";
import { TLogin } from "@/types/auth/auth.type";
import Button from "@/ui/Button";
import { maskCPF } from "@/utils/mask.util";
import { useAtom } from "jotai";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { GoEye, GoEyeClosed } from "react-icons/go";

export const LoginForm = () => {
    const [__, setIsLoading] = useAtom(loadingAtom);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { register, handleSubmit, formState: { errors }} = useForm<TLogin>();

    const login: SubmitHandler<TLogin> = async (body: TLogin) => {
        try {
            setIsLoading(true);
            const {data} = await api.post(`/auth/app/login`, body);
            const result = data.result.data;  
            
            localStorage.setItem("token", result.token);
            localStorage.setItem("refreshToken", result.refreshToken);
            localStorage.setItem("name", result.name);
            localStorage.setItem("photo", result.photo);
            localStorage.setItem("rapidocId", result.rapidocId);
            localStorage.setItem("tab", "home");
            router.push("/home");
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="flex flex-col flex-1 lg:w-1/2 w-full">
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div className="p-2">
                    <div className="mb-5 sm:mb-8 flex justify-center">
                        <Logo className="h-40"/>
                    </div>
                    <div>            
                        <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit(login)}>
                            <div>
                                <Label label="CPF" />
                                <Input onInput={(e: any) => maskCPF(e)} {...register("cpf")} />
                            </div>
                            <div>
                                <Label label="Senha" />
                                <div className="relative">
                                    <Input type={showPassword ? "text" : "password"} {...register("password")} />
                                    <span onClick={() => setShowPassword(!showPassword)} className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2" >
                                    {showPassword ? (
                                        <GoEye />
                                    ) : (
                                        <GoEyeClosed />
                                    )}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">                  
                                <Link href="/reset-password" className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400" >
                                    Esqueceu sua senha?
                                </Link>
                            </div>
                            <div>
                                <Button className="w-full" size="sm">Entrar</Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}