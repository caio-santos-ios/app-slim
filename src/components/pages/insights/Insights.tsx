"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { VitalStepAtom } from "@/jotai/vital/vital.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import Button from "@/ui/Button";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";

export const Insights = () => {
    const [_, setLoading]       = useAtom(loadingAtom);
    const [step, setStep]       = useAtom(VitalStepAtom);

    const router = useRouter();

    const { watch, reset } = useForm({
        defaultValues: {
            id: "",
            sleepTime: "",
            sleepHours: 8,
            sleepFragmentation: "Não",
            sleepQuality: 5,
            sleepCell: ""
        }
    });

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
    
    const values = watch();

    const renderStep = () => {
        switch (step) {
            case 1: return <CardInsightsSono data={values} />;
            case 2: return <CardInsightsNutricao data={values} />;
            case 3: return <CardInsightsMental data={values} />;
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
        setLoading(false);
    }, [watch("id")]);

    return (
        <>
            <h1 className="mb-1.5 block text-md font-bold text-brand-400">Insights</h1>

            {/* Pauta 13: tabs de navegação entre os steps disponíveis */}
            {[1, 2, 3].some(s => [1, 2, 3].includes(s)) && (
                <div className="flex bg-gray-100 p-1 rounded-2xl mb-3 gap-1">
                    {[
                        { s: 1, label: '🌙 Sono' },
                        { s: 2, label: '🥗 Nutrição' },
                        { s: 3, label: '🧠 Mental' },
                    ].map(({ s, label }) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setStep(s)}
                            className={`flex-1 py-1.5 px-1 text-[11px] font-bold rounded-xl transition-all ${step === s ? 'bg-white text-brand-500 shadow-sm' : 'text-gray-400'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}

            <div className="h-[calc(100dvh-18rem)] overflow-y-auto">
                {renderStep()}

                <Link href="/home/">
                    <Button type="button" variant="primary" className="w-full">
                        Voltar
                    </Button>
                </Link>
            </div>
        </>
    );
};

const CardInsightsSono = ({ data }: { data: any }) => {
    const igs = data?.metric?.igs ?? 0;

    const insight = igs < 70
        ? "Seu pilar de Sono está em desequilíbrio, afetando sua regeneração celular."
        : "Boa qualidade de repouso.";

    const dose = igs < 70
        ? "Foco do dia: Priorizar 8h de repouso e evitar telas à noite."
        : "Manter rotina.";

    const subInsights = [
        { condition: igs < 70,  insight: "Privação de sono detectada. Isso reduz sua imunidade e foco amanhã.",           dose: "Tente dormir 30min mais cedo hoje para compensar o déficit." },
        { condition: igs < 90,  insight: "Sua condição pode estar limitando sua recuperação real. Tente relaxar antes de deitar.", dose: "Realize 5min de respiração profunda ou meditação antes de deitar." },
        { condition: igs < 50,  insight: "Desvio crítico de horário! Você está brigando com seu relógio biológico.",       dose: "Coloque um alarme para preparação do sono 1h antes do seu alvo." },
        { condition: igs < 90,  insight: "Fragmentação do sono detectada. Isso impacta sua recuperação.",                  dose: "Evite líquidos 1h antes de deitar e verifique a temperatura do quarto." },
    ].filter(t => t.condition);

    const isGood = igs >= 85;
    const isMid  = igs >= 60 && igs < 85;

    const headerColor = isGood ? '#1D9E75' : isMid ? '#BA7517' : '#E24B4A';
    const bg          = isGood ? '#E1F5EE' : isMid ? '#FAEEDA' : '#FCEBEB';
    const border      = isGood ? '#9FE1CB' : isMid ? '#FAC775' : '#F09595';
    const status      = isGood ? 'Excelente' : isMid ? 'Atenção' : 'Crítico';

    return (
        <div className="flex flex-col gap-4 mb-2">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-brand-500">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-3xl">🌙</div>
                <div>
                    <p className="text-white font-bold text-base">Sono de hoje</p>
                    <p className="text-white/70 text-xs">Análise do seu descanso noturno</p>
                </div>
            </div>

            {/* Score */}
            <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: bg, border: `1px solid ${border}` }}>
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold" style={{ color: headerColor }}>Score do Sono</span>
                    <span className="text-4xl font-bold" style={{ color: headerColor }}>{Math.round(igs)}</span>
                </div>
                <span className="text-sm font-bold px-3 py-1.5 rounded-full" style={{ background: border, color: headerColor }}>{status}</span>
            </div>

            {/* Insight principal */}
            <div className="rounded-2xl p-4 flex flex-col gap-2 bg-brand-50 border border-brand-100">
                <span className="text-xs font-bold text-brand-500 text-center">💡 Insight</span>
                <p className="text-sm text-brand-500 leading-relaxed font-medium text-center">{insight}</p>
            </div>

            {/* Dose de saúde */}
            <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: bg, border: `1px solid ${border}` }}>
                <span className="text-xs font-bold text-center" style={{ color: headerColor }}>💊 Dose de Saúde</span>
                <p className="text-sm leading-relaxed font-medium text-center" style={{ color: headerColor }}>{dose}</p>
            </div>
        </div>
    );
};

const CardInsightsNutricao = ({ data }: { data: any }) => {
    const ign = data?.metric?.ign ?? 0;

    const insight = ign < 70
        ? "O impacto glicêmico e os horários estão sobrecarregando seu metabolismo."
        : "Metabolismo em equilíbrio.";

    const dose = ign < 70
        ? "Foco do dia: Alinhar horários de refeição e reduzir carga glicêmica."
        : "Seguir plano alimentar.";

    const subInsights = [
        { condition: ign < 80,  insight: "O horário da ceia impacta sua glicemia. Tente alinhar com o horário alvo.",     dose: "Programe sua última refeição para no máximo 2h antes de dormir." },
        { condition: ign < 70,  insight: "Intervalo irregular detectado. Cuidado com picos de fome.",                     dose: "Planeje pequenos lanches saudáveis entre as refeições amanhã." },
        { condition: ign < 60,  insight: "Carga glicêmica elevada! Isso exige mais do seu pâncreas.",                     dose: "Na próxima refeição, adicione fibras (salada/grãos) para reduzir o impacto glicêmico." },
        { condition: ign < 100, insight: "Para seu perfil, beba mais água para proteger seu metabolismo.",                dose: "Beba 2 copos de água agora e use um app de lembrete." },
    ].filter(t => t.condition);

    const isGood = ign >= 85;
    const isMid  = ign >= 60 && ign < 85;

    const headerColor = isGood ? '#1D9E75' : isMid ? '#BA7517' : '#E24B4A';
    const bg          = isGood ? '#E1F5EE' : isMid ? '#FAEEDA' : '#FCEBEB';
    const border      = isGood ? '#9FE1CB' : isMid ? '#FAC775' : '#F09595';
    const status      = isGood ? 'Excelente' : isMid ? 'Atenção' : 'Crítico';

    return (
        <div className="flex flex-col gap-4 mb-2">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-brand-500">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-3xl">🥗</div>
                <div>
                    <p className="text-white font-bold text-base">Nutrição de hoje</p>
                    <p className="text-white/70 text-xs">Análise dos seus hábitos alimentares</p>
                </div>
            </div>

            {/* Score */}
            <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: bg, border: `1px solid ${border}` }}>
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold" style={{ color: headerColor }}>Score da Nutrição</span>
                    <span className="text-4xl font-bold" style={{ color: headerColor }}>{Math.round(ign)}</span>
                </div>
                <span className="text-sm font-bold px-3 py-1.5 rounded-full" style={{ background: border, color: headerColor }}>{status}</span>
            </div>

            {/* Insight principal */}
            <div className="rounded-2xl p-4 flex flex-col gap-2 bg-brand-50 border border-brand-100">
                <span className="text-xs font-bold text-brand-500 text-center">💡 Insight</span>
                <p className="text-sm text-brand-500 leading-relaxed font-medium text-center">{insight}</p>
            </div>

            {/* Dose de saúde */}
            <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: bg, border: `1px solid ${border}` }}>
                <span className="text-xs font-bold text-center" style={{ color: headerColor }}>💊 Dose de Saúde</span>
                <p className="text-sm leading-relaxed font-medium text-center" style={{ color: headerColor }}>{dose}</p>
            </div>
        </div>
    );
};

const CardInsightsMental = ({ data }: { data: any }) => {
    const ies   = data?.metric?.ies ?? 0;
    const total = (data?.dass1 ?? 0) + (data?.dass2 ?? 0) + (data?.dass3 ?? 0)
                + (data?.dass4 ?? 0) + (data?.dass5 ?? 0) + (data?.dass6 ?? 0)
                + (data?.dass7 ?? 0) + (data?.dass8 ?? 0) + (data?.dass9 ?? 0);

    const insight = total <= 5
        ? "Sua saúde emocional está resiliente hoje. Mantenha suas práticas de descompressão."
        : total <= 12
        ? "Nível leve/moderado de tensão detectado."
        : total <= 18
        ? "Sinais de estresse/ansiedade acentuados."
        : "Sobrecarga emocional severa. Ação: Priorize o protocolo de descompressão e considere falar com um especialista.";

    const dose = total <= 5
        ? "Continue cultivando seu equilíbrio emocional."
        : total <= 12
        ? "Realize 5min de respiração guiada agora."
        : total <= 18
        ? "Antecipe seu horário de sono e evite telas à noite."
        : "Priorize descompressão e considere ajuda especializada.";

    const classification = total <= 5
        ? { label: 'Excelente', color: '#1D9E75', bg: '#E1F5EE', border: '#9FE1CB' }
        : total <= 12
        ? { label: 'Atenção',   color: '#BA7517', bg: '#FAEEDA', border: '#FAC775' }
        : total <= 18
        ? { label: 'Risco',     color: '#E24B4A', bg: '#FCEBEB', border: '#F09595' }
        : { label: 'Crítico',   color: '#A32D2D', bg: '#FCEBEB', border: '#F09595' };

    const depression = (data?.dass1 ?? 0) + (data?.dass2 ?? 0) + (data?.dass3 ?? 0);
    const anxiety    = (data?.dass4 ?? 0) + (data?.dass5 ?? 0) + (data?.dass6 ?? 0);
    const stress     = (data?.dass7 ?? 0) + (data?.dass8 ?? 0) + (data?.dass9 ?? 0);

    const getDim = (v: number) => v > 5
        ? { color: '#E24B4A', bg: '#FCEBEB', border: '#F09595', label: 'Atenção' }
        : v >= 3
        ? { color: '#BA7517', bg: '#FAEEDA', border: '#FAC775', label: 'Moderado' }
        : { color: '#1D9E75', bg: '#E1F5EE', border: '#9FE1CB', label: 'Normal' };

    return (
        <div className="flex flex-col gap-4 mb-2">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-brand-500">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-3xl">🧘</div>
                <div>
                    <p className="text-white font-bold text-base">Saúde mental de hoje</p>
                    <p className="text-white/70 text-xs">Análise do seu estado emocional</p>
                </div>
            </div>

            <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: classification.bg, border: `1px solid ${classification.border}` }}>
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold" style={{ color: classification.color }}>Score Mental</span>
                    <span className="text-4xl font-bold" style={{ color: classification.color }}>{Math.round(ies)}</span>
                </div>
                <span className="text-sm font-bold px-3 py-1.5 rounded-full" style={{ background: classification.border, color: classification.color }}>{classification.label}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {[
                    { label: 'Depressão', value: depression, icon: '🧠' },
                    { label: 'Ansiedade', value: anxiety,    icon: '💭' },
                    { label: 'Estresse',  value: stress,     icon: '⚡' },
                ].map(({ label, value, icon }) => {
                    const d = getDim(value);
                    return (
                        <div key={label} className="rounded-2xl p-3 flex flex-col gap-1 items-center" style={{ background: d.bg, border: `1px solid ${d.border}` }}>
                            <span style={{ fontSize: 16 }}>{icon}</span>
                            <span className="text-[10px] font-bold text-center" style={{ color: d.color }}>{label}</span>
                            <span className="text-lg font-bold" style={{ color: d.color }}>{value}</span>
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: d.border, color: d.color }}>{d.label}</span>
                        </div>
                    );
                })}
            </div>

            <div className="rounded-2xl p-4 flex flex-col gap-2 bg-brand-50 border border-brand-100">
                <span className="text-xs font-bold text-brand-500 text-center">💡 Insight</span>
                <p className="text-sm text-brand-500 leading-relaxed font-medium text-center">{insight}</p>
            </div>

            <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: classification.bg, border: `1px solid ${classification.border}` }}>
                <span className="text-xs font-bold text-center" style={{ color: classification.color }}>💊 Dose de Saúde</span>
                <p className="text-sm leading-relaxed font-medium text-center" style={{ color: classification.color }}>{dose}</p>
            </div>
        </div>
    );
};