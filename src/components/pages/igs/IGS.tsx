"use client";

import Input from "@/components/form/input/Input";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { VitalCheckInAtom, VitalIsManualModeAtom, VitalStepAtom } from "@/jotai/vital/vital.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import Button from "@/ui/Button";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { VitalMental } from "../vital-mental/VitalMental";
import { VitalNutricao } from "../vital-nutricao/VitalNutricao";
import { VitalSono } from "../vital-sono/VitalSono";

export const CheckIn = () => {
    const [_, setLoading] = useAtom(loadingAtom);
    const [___, setIsCheckIn] = useAtom(VitalCheckInAtom);
    const [isManualMode, setIsManualMode] = useAtom(VitalIsManualModeAtom);
    const [step, setStep] = useAtom(VitalStepAtom);
    const [permissionStep, setPermissionStep] = useState<number[]>([]);

    const router = useRouter();

    const { register, watch, setValue, getValues, reset } = useForm({
        defaultValues: {
            id: "",
            sleepTime: "",
            sleepHours: 8,
            sleepFragmentation: "Não",
            sleepQuality: 5,
            sleepCell: ""
        }
    });

    const save = async (body: any) => {
        try {
            setLoading(true);
            if (!body.id) {
                await api.post(`/vitals`, { ...body, chekinIGS: true }, configApi());
                resolveResponse({ status: 200, message: 'Check-in IGS feito com sucesso!' });
                setTimeout(() => router.push("/home"), 300);
            } else {
                await api.put(`/vitals`, { ...body, chekinIGN: true, chekinIES: true }, configApi());
                resolveResponse({ status: 200, message: 'Check-in salvo com sucesso!' });
                setTimeout(() => router.push("/home"), 300);
            }
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    
    const getLogged = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/vitals/beneficiary`, configApi());
            const result = data.result.data;
            if (result) reset(result);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1: return <VitalSono register={register} watch={watch} setValue={setValue} className="max-h-[calc(100dvh-21rem)]" />;
            case 2: return <VitalNutricao register={register} watch={watch} setValue={setValue} className="max-h-[calc(100dvh-21rem)]"/>;
            case 3: return <VitalMental setValue={setValue} watch={watch} className="max-h-[calc(100dvh-23.5rem)]"/>;
            default: return null;
        }
    };

    useEffect(() => {
        getLogged();
    }, []);

    useEffect(() => {
        const id = watch("id");
        const hora = new Date().getHours();

        let steps: number[] = [];

        if (!id) {
            // Sem vital hoje → só IGS (manhã)
            steps = [1];
        } else {
            // Vital existe → IGN e/ou IES disponíveis a partir das 18h
            if (hora >= 16) {
                steps = [2, 3];
            } else {
                // Antes das 18h mas já tem vital → nada disponível ainda
                steps = [];
            }
        }

        // Garante step inicial correto ao montar
        if (steps.length > 0) setStep(steps[0]);

        setPermissionStep(steps);
        setLoading(false);
    }, [watch("id")]);

    const firstStep = permissionStep.length > 0 ? Math.min(...permissionStep) : 1;
    const lastStep  = permissionStep.length > 0 ? Math.max(...permissionStep) : 1;
    const isFirst   = step === firstStep;
    const isLast    = step === lastStep;

    return (
        <div className="bg-white p-2 rounded-2xl border border-gray-200 h-[calc(100dvh-13rem)] overflow-y-auto">
            {renderStep()}

            <div className="flex gap-4 mt-2 px-2">
                {/* Voltar — só aparece se não estiver no primeiro step permitido */}
                {!isFirst && (
                    <Button
                        type="button"
                        variant="outline-primary"
                        className="flex-1"
                        onClick={() => setStep(step - 1)}>
                        Voltar
                    </Button>
                )}

                {/* Próximo — só aparece se o próximo step estiver na lista de permissões */}
                {!isLast ? (
                    <Button
                        type="button"
                        className="flex-1"
                        onClick={() => setStep(step + 1)}
                    >
                        Próximo
                    </Button>
                ) : (
                    /* Finalizar — aparece apenas no último step permitido */
                    <Button
                        type="button"
                        className="flex-1"
                        onClick={() => save({ ...getValues() })}
                    >
                        {permissionStep.length > 1 ? "Finalizar" : "Salvar Check-in"}
                    </Button>
                )}
            </div>
        </div>
    );
};