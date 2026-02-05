"use client";

import Input from "@/components/form/input/Input";
import Label from "@/components/form/LabelForm";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { profileAtom } from "@/jotai/profile/profile.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { TProfile } from "@/types/profile/profile.type";
import Button from "@/ui/Button";
import { maskCPF, maskPhone } from "@/utils/mask.util";
import { useAtom } from "jotai";
import Link from "next/link";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { montserrat } from "../dass21/Dass21";

export const ProfileForm = () => {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const { reset, register, watch, handleSubmit, setValue} = useForm<TProfile>();

    const save: SubmitHandler<TProfile> = async (body: TProfile) => {
        try {
            setIsLoading(true);
            const {data} = await api.put(`/customer-recipients/profile`, body, configApi());
            const result = data.result;  
            resolveResponse({status: 200, ...result});
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getLogged = async () => {
        try {
            setIsLoading(true);
            const {data} = await api.get(`/customer-recipients/logged`, configApi());
            const result = data.result.data;  
            reset(result)
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const calcularIMC = (peso: number, altura: number) => {
        if (altura > 0) {
            const imc = peso / (altura * altura);
            return imc.toFixed(2); 
        }
        return 0;
    };

    const calcularMetaAgua = (peso: number) => {
        if (!peso || peso <= 0) return "0.0 L";
        const ml = peso * 35;
        const litros = ml / 1000;
        return `${litros.toFixed(1)} L`;
    };

    useEffect(() => {
        const initial = async () => {
            await getLogged();
        }
        initial();
    }, []);
    
    return (
        <form onSubmit={handleSubmit(save)} className={`${montserrat.className} grid grid-cols-4 gap-4`}>
            <h1 className="mb-1.5 block text-md font-bold text-gray-700 dark:text-gray-400">Meu Perfil</h1>
            
            <div className="col-span-4 max-h-[calc(100dvh-19.5rem)] overflow-y-auto">
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-4">
                        <Label label="Nome" />
                        <Input {...register("name")} />
                    </div>
                    <div className="col-span-4">
                        <Label label="E-mail" />
                        <Input {...register("email")} />
                    </div>
                    <div className="col-span-2">
                        <Label label="Telefone" />
                        <Input onInput={(e: any) => maskPhone(e)} {...register("phone")} />
                    </div>
                    <div className="col-span-2">
                        <Label label="CPF" />
                        <Input onInput={(e: any) => maskCPF(e)} {...register("cpf")} />
                    </div>
                    <div className="col-span-2">
                        <Label label="Peso" />
                        <Input type="number" {...register("weight")} />
                    </div>
                    <div className="col-span-2">
                        <Label label="Altura" />
                        <Input step="0.01" type="number" {...register("height")} />
                    </div>
                    <div className="col-span-2">
                        <Label label="IMC" required={false}/>
                        <Input disabled value={calcularIMC(watch('weight'), watch('height'))} placeholder=""/>
                    </div>
                    <div className="col-span-2">
                        <Label label="Meta Água" required={false}/>
                        <Input disabled value={calcularMetaAgua(watch("weight"))} placeholder=""/>
                    </div>
                    <div className="col-span-2">
                        <Label label="Horário alvo para dormir" required={false}/>
                        <input type="time" {...register("targetSleepTime")} className="h-11 w-full border border-(--color-brand-200) focus:border-(--color-brand-200) focus:outline-hidden rounded-lg px-3 py-2" />
                    </div>
                </div>
            </div>
            <div className="col-span-2">
                <Link href="/home/profile">
                    <Button type="button" variant="outline-secondary" className="w-full" size="sm">Cancelar</Button>
                </Link>
            </div>
            <div className="col-span-2">
                <Button variant="secondary" className="w-full" size="sm">Salvar</Button>
            </div>
        </form>
    )
}