"use client";

import Button from "@/ui/Button";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { VitalSono } from "../vital-sono/VitalSono";
import { VitalNutricao } from "../vital-nutricao/VitalNutricao";
import { VitalMental } from "../vital-mental/VitalMental";
import { useAtom } from "jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { VitalCheckInAtom, VitalModalAtom } from "@/jotai/vital/vital.jotai";
import { montserrat } from "../dass21/Dass21";

export default function VitalModal() {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [__, setModal] = useAtom(VitalModalAtom);
    const [step, setStep] = useState(1);
    const [___, setIsCheckIn] = useAtom(VitalCheckInAtom);
    const { register, watch, setValue, getValues } = useForm({
        defaultValues: {
            sleepTime: "",
            sleepHours: 8,
            waterAmount: 0,
            mood: "bom",
            id: ""
        }
    });

    const save = async (body: any) => {
        try {
            setIsLoading(true);
            if(!body.id) {
                await api.post(`/vitals`, body, configApi());
            } else {
                await api.put(`/vitals`, body, configApi());
            };

            resolveResponse({status: 200, message: 'Salvo com sucesso!'});
            setModal(false);
            setIsCheckIn(false);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getLogged = async () => {
        try {
            setIsLoading(true);
            const {data} = await api.get(`/vitals/beneficiary`, configApi());
            const result = data.result.data;
            if(result) {
                // setValue("id", result.id);
            };
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1: return <VitalSono register={register} watch={watch} setValue={setValue} />;
            case 2: return <VitalNutricao register={register} watch={watch} setValue={setValue} />;
            case 3: return <VitalMental setValue={setValue} watch={watch} />;
            default: return null;
        }
    };

    useEffect(() => {
        const initial = async () => {
            // await getLogged();
        }
        initial();
    }, [])

    return (
        <div className={`${montserrat.className} h-[calc(100dvh-13rem)] py-2 max-w-md mx-auto bg-white rounded-2xl border border-gray-200`}>
            <div className="flex gap-2 px-4 py-3">
                {[1, 2, 3].map((s) => (
                    <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${step >= s ? 'bg-brand-2-600' : 'bg-gray-300'}`} />
                ))}
            </div>

            <div>
                <div className="px-3">
                    {renderStep()}
                </div>

                <div className="flex gap-4 mt-2 px-2">
                    {step > 1 && (
                        <Button type="button" variant="outline-primary" className="flex-1" onClick={() => setStep(step - 1)}>
                            Voltar
                        </Button>
                    )}
                    {step < 3 ? (
                        <Button type="button" className="flex-1" onClick={() => setStep(step + 1)}>
                            Próximo
                        </Button>
                    ) : (
                        <Button onClick={() => save({...getValues()})} type="button" className="flex-1">Finalizar</Button>
                    )}
                </div>
            </div>
        </div>
    );
}