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
import Link from "next/link";
import { createMetricAppService } from "@/service/metric-app.service";

// Pauta 10: ciclo de animações — alterna entre manha/noite/completo para não cansar o usuário
const ANIM_CYCLE_KEY = "checkInAnimCycleIndex";
type AnimType = "manha" | "noite" | "completo";

function getNextAnimacao(base: AnimType): AnimType {
    const cycles: AnimType[] = ["manha", "noite", "completo"];
    try {
        const stored = localStorage.getItem(ANIM_CYCLE_KEY);
        const current = stored !== null ? parseInt(stored, 10) : -1;
        const next = (current + 1) % cycles.length;
        localStorage.setItem(ANIM_CYCLE_KEY, String(next));
        return cycles[next];
    } catch {
        return base;
    }
}

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
                // Pauta 10: ciclo de animações — para check-in completo, alterna entre as 3
                setAnimacao(getNextAnimacao("completo"));
                await createMetricAppService({
                    screen: "Check-in Completo",
                    action: "Realização",
                    function: "Realização do Check-in Completo",
                    description: "Ao realizar o Check-in Completo, o usuário completa as atividades de sono, nutrição e saúde mental em um único momento, geralmente no período da noite. Esta ação concede pontos para todas as categorias de check-in, incentivando o usuário a manter uma rotina consistente de autocuidado. O ciclo de animações alterna entre manhã, noite e completo para proporcionar uma experiência visual variada e engajadora.",
                    parent: "customer-recipient",
                    parentId: ""
                });
            } else if (!body.id) {
                await api.post(`/vitals`, { ...body, chekinIGS: true, chekinIGSPoint: 5 }, configApi());
                // Pauta 10: ciclo — check-in manhã alterna entre manha e completo
                setAnimacao(getNextAnimacao("manha"));
                await createMetricAppService({
                    screen: "Check-in da Manhã",
                    action: "Realização",
                    function: "Realização do Check-in da Manhã",
                    description: "Ao realizar o Check-in da Manhã, o usuário completa as atividades relacionadas ao sono, como informar o horário de dormir, horas de sono, qualidade do sono e fragmentação. Esta ação concede pontos para a categoria de check-in de sono, incentivando o usuário a manter uma rotina saudável de descanso. O ciclo de animações alterna entre manhã e completo para proporcionar uma experiência visual variada e engajadora.",
                    parent: "customer-recipient",
                    parentId: ""
                });
            } else {
                await api.put(`/vitals`, {
                    ...body,
                    chekinIGN: true, chekinIGNPoint: 5,
                    chekinIES: true, chekinIESPoint: 5,
                }, configApi());
                // Pauta 10: ciclo — check-in noite alterna entre noite e completo
                setAnimacao(getNextAnimacao("noite"));
                await createMetricAppService({
                    screen: "Check-in da Noite",
                    action: "Realização",
                    function: "Realização do Check-in da Noite",
                    description: "Ao realizar o Check-in da Noite, o usuário completa as atividades relacionadas à nutrição e saúde mental, como informar se fez refeições saudáveis e se praticou atividades de autocuidado mental. Esta ação concede pontos para as categorias de check-in de nutrição e saúde mental, incentivando o usuário a manter hábitos saudáveis nessas áreas. O ciclo de animações alterna entre noite e completo para proporcionar uma experiência visual variada e engajadora.",
                    parent: "customer-recipient",
                    parentId: ""
                });
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