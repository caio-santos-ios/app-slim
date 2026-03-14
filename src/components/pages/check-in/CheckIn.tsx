"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { VitalStepAtom } from "@/jotai/vital/vital.jotai";
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
import { CheckInCompletoAnimation, CheckInManhaAnimation, CheckInNoiteAnimation } from "@/components/animations/Animations";
import { steps } from "framer-motion";
import Link from "next/link";

export const CheckIn = () => {
    const [_, setLoading]       = useAtom(loadingAtom);
    const [step, setStep]       = useAtom(VitalStepAtom);
    const [permissionStep, setPermissionStep] = useState<number[]>([]);

    const [animacao, setAnimacao] = useState<"manha" | "noite" | "completo" | null>(null);

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
            const hora = new Date().getHours();

            if (!body.id && hora >= 18) {
                await api.post(`/vitals`, {
                    ...body,
                    chekinIGS: true, chekinIGSPoint: 5,
                    chekinIGN: true, chekinIGNPoint: 5,
                    chekinIES: true, chekinIESPoint: 5,
                }, configApi());
                setAnimacao("completo");
            } else if (!body.id) {
                await api.post(`/vitals`, { ...body, chekinIGS: true, chekinIGSPoint: 5 }, configApi());
                setAnimacao("manha");
            } else {
                await api.put(`/vitals`, {
                    ...body,
                    chekinIGN: true, chekinIGNPoint: 5,
                    chekinIES: true, chekinIESPoint: 5,
                }, configApi());
                setAnimacao("noite");
            }

            resolveResponse({ status: 200, message: 'Parabéns!' });
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
        if (permissionStep.length === 0 && watch("id")) {
            return (
                <div className="flex flex-col items-center justify-center h-80 gap-4 py-4 text-center">
                    <div className="text-5xl">☀️</div>
                    <h2 className="text-brand-500 font-bold text-lg">Check-in da manhã concluído!</h2>
                    <p className="text-gray-400 text-sm">Seu próximo check-in estará disponível a partir das <span className="font-bold text-brand-500">18h</span>.</p>
                </div>
            );
        }

        switch (step) {
            case 1: return <VitalSono register={register} watch={watch} setValue={setValue} className="max-h-[calc(100dvh-21rem)]" />;
            case 2: return <VitalNutricao register={register} watch={watch} setValue={setValue} className="max-h-[calc(100dvh-21rem)]" />;
            case 3: return <VitalMental setValue={setValue} watch={watch} className="max-h-[calc(100dvh-23.5rem)]" />;
            default: return null;
        }
    };

    useEffect(() => {
        getLogged();
    }, []);

    useEffect(() => {
        const id   = watch("id");
        const hora = new Date().getHours();
        let steps: number[] = [];

        if (!id) {
            if (hora >= 18) {
                steps = [1, 2, 3];
            } else {
                steps = [1];
            }
        } else {
            if (hora >= 18) {
                steps = [2, 3];
            } else {
                steps = [];
            }
        }

        if (steps.length > 0) setStep(steps[0]);
        setPermissionStep(steps);
        setLoading(false);
    }, [watch("id")]);

    const firstStep = permissionStep.length > 0 ? Math.min(...permissionStep) : 1;
    const lastStep  = permissionStep.length > 0 ? Math.max(...permissionStep) : 1;
    const isFirst   = step === firstStep;
    const isLast    = step === lastStep;

    const handleAnimacaoDone = () => {
        setAnimacao(null);
        router.push("/home/insights");
    };

    return (
        <>
            {animacao === "manha"    && <CheckInManhaAnimation    onDone={handleAnimacaoDone} />}
            {animacao === "noite"    && <CheckInNoiteAnimation    onDone={handleAnimacaoDone} />}
            {animacao === "completo" && <CheckInCompletoAnimation onDone={handleAnimacaoDone} />}

            <div className="bg-white p-2 rounded-2xl border border-gray-200 h-[calc(100dvh-13rem)] overflow-y-auto">
                {renderStep()}

                {/* <div className="flex gap-4 mt-2 px-2">
                    {!isFirst && (
                        <Button
                            type="button"
                            variant="outline-primary"
                            className="flex-1"
                            onClick={() => setStep(step - 1)}
                        >
                            Voltar
                        </Button>
                    )}

                    {!isLast ? (
                        <Button
                            type="button"
                            className="flex-1"
                            onClick={() => setStep(step + 1)}
                        >
                            Próximo
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            className="flex-1"
                            onClick={() => save({ ...getValues() })}
                        >
                            {permissionStep.length > 1 ? "Finalizar" : "Salvar Check-in"}
                        </Button>
                    )}
                </div> */}
                {permissionStep.length > 0 && (
                    <div className="flex gap-4 mt-2 px-2">
                        {!isFirst && (
                            <Button type="button" variant="outline-primary" className="flex-1" onClick={() => setStep(step - 1)}>
                                Voltar
                            </Button>
                        )}
                        {!isLast ? (
                            <Button type="button" className="flex-1" onClick={() => setStep(step + 1)}>
                                Próximo
                            </Button>
                        ) : (
                            <Button type="button" className="flex-1" onClick={() => save({ ...getValues() })}>
                                {permissionStep.length > 1 ? "Finalizar" : "Salvar Check-in"}
                            </Button>
                        )}
                    </div>
                )}

                {permissionStep.length == 0 && (
                    <Link href="/home/">
                        <Button type="button" variant="primary" className="w-full">
                            Voltar
                        </Button>
                    </Link>
                )}
            </div>
        </>
    );
};