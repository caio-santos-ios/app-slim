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
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { montserrat } from "../dass21/Dass21";

export const ProfileForm = () => {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [__, setPhoto] = useAtom(profileAtom);
    const [age, setAge] = useState<number>(0);
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
            setAge(calcularIdade(result.dateOfBirth));
            // calcularIdade(watch("dateOfBirth"))
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

    const uploadPhoto = async () => {
        const attachment: any = document.querySelector('#image');

        if(attachment.files.length > 0) {
            try {
                const formBody = new FormData();
                if(attachment) {
                    if (attachment.files[0]) formBody.append('photo', attachment.files[0]);
                };

                const { status, data } = await api.put(`/customer-recipients/profile-photo`, formBody, configApi(false));
                const result = data.result.data;
                setPhoto(result.photo);
                localStorage.setItem("photo", result.photo);
                resolveResponse({status, message: "Foto atualizada com sucesso!"});
                setValue("image", "");
            } catch (error) {
                resolveResponse(error);
            }
        };
    };

    const calcularIdade = (dataNascimento: any) => {
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);

        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mesAtual = hoje.getMonth();
        const diaAtual = hoje.getDate();
        
        const mesNasc = nascimento.getMonth();
        const diaNasc = nascimento.getDate();
        if (mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc)) {
            idade--;
        }

        return idade;
    }
    useEffect(() => {
        const sleepTime = watch("targetSleepTime");

        if (sleepTime) {
            const [hours, minutes] = sleepTime.split(':').map(Number);

            const date = new Date();
            date.setHours(hours);
            date.setMinutes(minutes);

            date.setHours(date.getHours() - 3);

            const lastSupperTime = date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            setValue("lastSupper", lastSupperTime);
        }
    }, [watch("targetSleepTime")]);

    useEffect(() => {
        const initial = async () => {
            await getLogged();
        }
        initial();
    }, []);
    
    return (
        <form onSubmit={handleSubmit(save)} className={`${montserrat.className} grid grid-cols-6 gap-4`}>
            <h1 className="col-span-6 mb-1.5 block text-md font-bold text-gray-700 dark:text-gray-400">Meu Perfil</h1>
            
            <div className="col-span-6 max-h-[calc(100dvh-19.5rem)] overflow-y-auto">
                <div className="grid grid-cols-6 gap-4">
                    <div className="col-span-6">
                        <Label label="Nome" />
                        <Input {...register("name")} />
                    </div>
                    <div className="col-span-6">
                        <Label label="E-mail" />
                        <Input {...register("email")} />
                    </div>
                    <div className="col-span-3">
                        <Label label="Telefone" />
                        <Input onInput={(e: any) => maskPhone(e)} {...register("phone")} />
                    </div>
                    <div className="col-span-3">
                        <Label label="CPF" />
                        <Input onInput={(e: any) => maskCPF(e)} {...register("cpf")} />
                    </div>
                    <div className="col-span-2">
                        <Label label="Idade" required={false}/>
                        <Input value={age} disabled />
                    </div>
                    <div className="col-span-2">
                        <Label label="Peso" />
                        <Input type="number" {...register("weight")} />
                    </div>
                    <div className="col-span-2">
                        <Label label="Altura" />
                        <Input step="0.01" type="number" {...register("height")} />
                    </div>
                    <div className="col-span-3">
                        <Label label="IMC" required={false}/>
                        <Input disabled value={calcularIMC(watch('weight'), watch('height'))} placeholder=""/>
                    </div>
                    <div className="col-span-3">
                        <Label label="Meta Água" required={false}/>
                        <Input disabled value={calcularMetaAgua(watch("weight"))} placeholder=""/>
                    </div>
                    <div className="col-span-3">
                        <Label label="Horário para dormir" required={false}/>
                        <input type="time" {...register("targetSleepTime")} className="h-11 w-full bg-white border border-(--color-brand-200) focus:border-(--color-brand-200) focus:outline-hidden rounded-lg px-3 py-2" />
                    </div>
                    <div className="col-span-3">
                        <Label label="Horário última ceia" required={false}/>
                        <input type="time" {...register("lastSupper")} className="h-11 w-full bg-white border border-(--color-brand-200) focus:border-(--color-brand-200) focus:outline-hidden rounded-lg px-3 py-2" />
                    </div>
                    <div className="col-span-6">
                        <Label label="Possui Patologia Metabólica?" required={false}/>
                        <select {...register("patrology")} className="h-11 w-full bg-white border border-(--color-brand-200) focus:border-(--color-brand-200) focus:outline-hidden rounded-lg px-3 py-2">
                            <option value="">Nenhum</option>
                            <option value="Diabetes">Diabetes</option>
                            <option value="Hipertensão">Hipertensão</option>
                            <option value="Ansiedade">Ansiedade</option>
                            <option value="Neoplasia">Neoplasia</option>
                            <option value="Bipolar">Bipolar</option>
                            <option value="Pós AVC">Pós AVC</option>
                            <option value="Outros">Outros</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="col-span-3">
                <Link href="/home/profile">
                    <Button type="button" variant="outline-secondary" className="w-full" size="sm">Cancelar</Button>
                </Link>
            </div>
            <div className="col-span-3">
                <Button variant="secondary" className="w-full" size="sm">Salvar</Button>
            </div>
        </form>
    )
}