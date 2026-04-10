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

// ─── ISO ─────────────────────────────────────────────────────────────────────
const ISO_QUESTIONS = [
    { id: "P1",  question: "Tenho clareza sobre as metas e o que é esperado do meu trabalho diariamente." },
    { id: "P2",  question: "Consigo organizar minhas tarefas de modo a realizar pausas e intervalos para refeições." },
    { id: "P3",  question: "As informações necessárias para realizar minhas atividades chegam de forma clara e no tempo certo." },
    { id: "P4",  question: "Tenho acesso às ferramentas e recursos necessários para cumprir minhas obrigações sem sobrecarga." },
    { id: "P5",  question: "O fluxo de trabalho no meu setor é planejado de forma a evitar urgências constantes." },
    { id: "P6",  question: "Recebo orientações e feedbacks que me ajudam a realizar minhas tarefas com segurança." },
    { id: "P7",  question: "As demandas profissionais são compatíveis com o meu horário de trabalho contratado." },
    { id: "P8",  question: "Existe um ambiente de colaboração mútua entre os colegas para a resolução de problemas." },
    { id: "P9",  question: "Sinto que as decisões e tratativas dentro do meu setor são conduzidas com imparcialidade." },
    { id: "P10", question: "Percebo que os esforços e bons resultados são valorizados pela gestão da empresa." },
    { id: "P11", question: "As normas de segurança e saúde são seguidas com rigor e prioridade no dia a dia." },
    { id: "P12", question: "Tenho previsibilidade sobre minhas atividades, o que me permite planejar minha rotina pessoal." },
] as const;

const ISO_OPTIONS = [
    { label: "Sempre",            score: 3 },
    { label: "Muitas Vezes",      score: 2 },
    { label: "Às Vezes",          score: 2 },
    { label: "Nunca / Raramente", score: 1 },
] as const;

type TISOQuestionId = (typeof ISO_QUESTIONS)[number]["id"];
type TISOAnsweredMap = Partial<Record<TISOQuestionId, { score: number; date: string }>>;

const ISO_STORAGE_KEY = "iso_checkin";
const todayStr = () => new Date().toISOString().split("T")[0];

function getISOQuestionForToday(answered: TISOAnsweredMap) {
    const today       = todayStr();
    const answeredIds = (Object.keys(answered) as TISOQuestionId[]).filter(k => answered[k]?.date === today);
    const remaining   = ISO_QUESTIONS.filter(q => !answeredIds.includes(q.id));
    if (remaining.length === 0) return null;
    const dayIndex = Math.floor(Date.now() / 86400000);
    return remaining[dayIndex % remaining.length];
}
// ─────────────────────────────────────────────────────────────────────────────

// Pauta 10: ciclo de animações
const ANIM_CYCLE_KEY = "checkInAnimCycleIndex";
type AnimType = "manha" | "noite" | "completo";

function getNextAnimacao(base: AnimType): AnimType {
    const cycles: AnimType[] = ["manha", "noite", "completo"];
    try {
        const stored  = localStorage.getItem(ANIM_CYCLE_KEY);
        const current = stored !== null ? parseInt(stored, 10) : -1;
        const next    = (current + 1) % cycles.length;
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

    const [animacao, setAnimacao] = useState<AnimType | null>(null);

    // ISO state
    const [isoQuestion,    setIsoQuestion]    = useState<(typeof ISO_QUESTIONS)[number] | null>(null);
    const [isoSelectedIdx, setIsoSelectedIdx] = useState<number | null>(null);
    const [isoDoneToday,   setIsoDoneToday]   = useState(false);

    const [typeContractor, setTypeContractor] = useState<string>("");

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

    // ── salva ISO junto ao check-in principal ────────────────────────────
    const saveISO = async (vitalId: string) => {
        if (isoDoneToday || !isoQuestion || isoSelectedIdx === null) return;
        try {
            const opt   = ISO_OPTIONS[isoSelectedIdx];
            const score = opt.score;

            if (vitalId) {
                await api.put(`/vitals/iso`, {
                    id:                vitalId,
                    chekinISO:         true,
                    chekinISOPoint:    score,
                    chekinISOQuestion: isoQuestion.question,
                    chekinISOResponse: opt.label,
                }, configApi());
            } else {
                await api.post(`/vitals/iso`, {
                    chekinISO:         true,
                    chekinISOPoint:    score,
                    chekinISOQuestion: isoQuestion.question,
                    chekinISOResponse: opt.label,
                }, configApi());
            }

            const raw: TISOAnsweredMap = (() => {
                try { return JSON.parse(localStorage.getItem(ISO_STORAGE_KEY) || "{}"); } catch { return {}; }
            })();
            localStorage.setItem(ISO_STORAGE_KEY, JSON.stringify({
                ...raw,
                [isoQuestion.id]: { score, date: todayStr() }
            }));
        } catch {
            // ISO não bloqueia o check-in principal
        }
    };

    const save = async (body: any) => {
        try {
            setLoading(true);
            const hora = new Date().getHours();
            let savedId = body.id;

            if (!body.id && hora >= 18) {
                const { data } = await api.post(`/vitals`, {
                    ...body,
                    chekinIGS: true, chekinIGSPoint: 5,
                    chekinIGN: true, chekinIGNPoint: 5,
                    chekinIES: true, chekinIESPoint: 5,
                }, configApi());
                savedId = data?.result?.id ?? "";
                setAnimacao(getNextAnimacao("completo"));
                await createMetricAppService({
                    screen: "Check-in Completo", action: "Realização",
                    function: "Realização do Check-in Completo",
                    description: "Ao realizar o Check-in Completo, o usuário completa as atividades de sono, nutrição e saúde mental em um único momento, geralmente no período da noite. Esta ação concede pontos para todas as categorias de check-in, incentivando o usuário a manter uma rotina consistente de autocuidado.",
                    parent: "customer-recipient", parentId: ""
                });
            } else if (!body.id) {
                const { data } = await api.post(`/vitals`, { ...body, chekinIGS: true, chekinIGSPoint: 5 }, configApi());
                savedId = data?.result?.id ?? "";
                setAnimacao(getNextAnimacao("manha"));
                await createMetricAppService({
                    screen: "Check-in da Manhã", action: "Realização",
                    function: "Realização do Check-in da Manhã",
                    description: "Ao realizar o Check-in da Manhã, o usuário completa as atividades relacionadas ao sono, como informar o horário de dormir, horas de sono, qualidade do sono e fragmentação. Esta ação concede pontos para a categoria de check-in de sono, incentivando o usuário a manter uma rotina saudável de descanso.",
                    parent: "customer-recipient", parentId: ""
                });
            } else {
                savedId = body.id;
                await api.put(`/vitals`, {
                    ...body,
                    chekinIGN: true, chekinIGNPoint: 5,
                    chekinIES: true, chekinIESPoint: 5,
                }, configApi());
                setAnimacao(getNextAnimacao("noite"));
                await createMetricAppService({
                    screen: "Check-in da Noite", action: "Realização",
                    function: "Realização do Check-in da Noite",
                    description: "Ao realizar o Check-in da Noite, o usuário completa as atividades relacionadas à nutrição e saúde mental, como informar se fez refeições saudáveis e se praticou atividades de autocuidado mental. Esta ação concede pontos para as categorias de check-in de nutrição e saúde mental.",
                    parent: "customer-recipient", parentId: ""
                });
            }

            await saveISO(savedId);
            resolveResponse({ status: 200, message: "Parabéns!" });
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
            const result   = data.result.data;
            if (result) reset(result);
            if (result?.chekinISO) setIsoDoneToday(true);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setLoading(false);
        }
    };

    // ── steps: sem mudança, continuam sendo 1, 2, 3 ─────────────────────
    useEffect(() => {
        const type = localStorage.getItem("appTypeContractor");
        if(type) setTypeContractor(type);

        getLogged();
        const raw: TISOAnsweredMap = (() => {
            try { return JSON.parse(localStorage.getItem(ISO_STORAGE_KEY) || "{}"); } catch { return {}; }
        })();
        setIsoQuestion(getISOQuestionForToday(raw));
    }, []);

    useEffect(() => {
        const id   = watch("id");
        const hora = new Date().getHours();
        let steps: number[] = [];

        if (!id) {
            steps = hora >= 18 ? [1, 2, 3] : [1];
        } else {
            steps = hora >= 18 ? [2, 3] : [];
        }

        if (steps.length > 0) setStep(steps[0]);
        setPermissionStep(steps);
        setLoading(false);
    }, [watch("id")]);

    const firstStep = permissionStep.length > 0 ? Math.min(...permissionStep) : 1;
    const lastStep  = permissionStep.length > 0 ? Math.max(...permissionStep) : 1;
    const isFirst   = step === firstStep;
    const isLast    = step === lastStep;

    // bloqueia Finalizar se ISO disponível e sem resposta, apenas no último step
    const isoBlocked = isLast && !isoDoneToday && !!isoQuestion && isoSelectedIdx === null;

    const handleAnimacaoDone = () => {
        setAnimacao(null);
        router.push("/home/insights");
    };

    // ── render do step principal ─────────────────────────────────────────
    const renderStep = () => {
        if (permissionStep.length === 0 && watch("id")) {
            return (
                <div className="flex flex-col items-center justify-center h-80 gap-4 py-4 text-center">
                    <div className="text-5xl">☀️</div>
                    <h2 className="text-brand-500 font-bold text-lg">Check-in da manhã concluído!</h2>
                    <p className="text-gray-400 text-sm">
                        Seu próximo check-in estará disponível a partir das{" "}
                        <span className="font-bold text-brand-500">18h</span>.
                    </p>
                </div>
            );
        }

        switch (step) {
            case 1: return <VitalSono     register={register} watch={watch} setValue={setValue} className="max-h-[calc(100dvh-21rem)]" />;
            case 2: return <VitalNutricao register={register} watch={watch} setValue={setValue} className="max-h-[calc(100dvh-21rem)]" />;
            case 3: return <VitalMental   setValue={setValue} watch={watch}                     className="max-h-[calc(100dvh-23.5rem)]" />;
            default: return null;
        }
    };

    // ── pergunta ISO — aparece no rodapé do último step ──────────────────
    const renderISOQuestion = () => {
        if (!isLast || isoDoneToday || !isoQuestion) return null;
        return (
            <div className="mt-3 mx-2 rounded-xl border border-brand-100 bg-brand-50 p-3">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-500 text-white">
                        {isoQuestion.id}
                    </span>
                    <span className="text-xs text-brand-500 font-semibold">Pergunta ISO do dia</span>
                </div>
                <p className="text-sm font-medium text-gray-700 leading-relaxed mb-3">
                    {isoQuestion.question}
                </p>
                <div className="flex flex-col gap-2">
                    {ISO_OPTIONS.map((opt, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setIsoSelectedIdx(idx)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all w-full border ${
                                isoSelectedIdx === idx
                                    ? "border-brand-500 bg-white"
                                    : "border-gray-200 bg-white"
                            }`}
                        >
                            <span className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center border-2 transition-all ${
                                isoSelectedIdx === idx ? "border-brand-500 bg-brand-500" : "border-gray-300"
                            }`}>
                                {isoSelectedIdx === idx && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                            <span className="text-sm text-gray-700 flex-1">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            {animacao === "manha"    && <CheckInManhaAnimation    onDone={handleAnimacaoDone} />}
            {animacao === "noite"    && <CheckInNoiteAnimation    onDone={handleAnimacaoDone} />}
            {animacao === "completo" && <CheckInCompletoAnimation onDone={handleAnimacaoDone} />}

            <div className="bg-white p-2 rounded-2xl border border-gray-200 h-[calc(100dvh-13rem)] overflow-y-auto">
                {renderStep()}
                {typeContractor == "B2B" && renderISOQuestion()}

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
                            <Button
                                type="button"
                                className="flex-1"
                                onClick={() => save({ ...getValues() })}
                                disabled={isoBlocked}
                            >
                                {permissionStep.length > 1 ? "Finalizar" : "Salvar Check-in"}
                            </Button>
                        )}
                    </div>
                )}

                {permissionStep.length === 0 && (
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
