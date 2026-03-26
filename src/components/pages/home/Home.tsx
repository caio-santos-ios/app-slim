"use client";

import { useAtom } from "jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import VitalModal from "../vital-modal/VitalModal";
import { VitalCheckInAtom, VitalModalAtom } from "@/jotai/vital/vital.jotai";
import { configApi, isTokenExpiringSoon, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { FiAlertTriangle, FiPhone } from "react-icons/fi";
import { FaVideo } from "react-icons/fa";
import { maskDate } from "@/utils/mask.util";
import { montserrat } from "../dass21/Dass21";
import Label from "@/components/form/LabelForm";
import Input from "@/components/form/input/Input";
import Button from "@/ui/Button";
import Link from "next/link";
import RankingPreview from "../ranking/RankingPreview";
import { urlBase64ToUint8Array } from "@/utils/push";
import { LollipopChart } from "@/components/grafic/LollipopChart";
import { LineChartCustom } from "@/components/grafic/LineChart";
import { IpvRing } from "@/components/grafic/IpvRing";
import { IpvGauge } from "@/components/grafic/IpvGauge";

const chartData = [
    { value: 10 },
    { value: 100 - 10 }
];

export default function Home() {
    const [isLoading, setIsLoading] = useAtom(loadingAtom);
    const [modal, setModal] = useAtom(VitalModalAtom);
    const [isCheckIn, setIsCheckIn] = useAtom(VitalCheckInAtom);
    const [nextTelemedicine, setNextTelemedicine] = useState<any>({ date: "" });
    const [metric, setMetric] = useState<any>({ igs: 0, ign: 0, ies: 0, ipv: 0 });
    const [metricWeek, setMetricWeek] = useState<any[]>([]);
    const [periodo, setPeriodo] = useState('Semana');
    const [dass9, setDass9] = useState<any>({});
    const [startDate, setStartDate] = useState<string>("sem");
    const [endDate, setEndDate] = useState<string>("sem");
    const [cvv, setCVV] = useState(false);
    const [pad, setPAD] = useState(false);
    const [ready, setReady] = useState(false);
    const [checkIES, setCheckIES] = useState(false);
    // Pauta 5: KPI card ativo para exibir insight inline
    const [activeKpi, setActiveKpi] = useState<string | null>(null);
    // Pauta 11+12: contagem de dias consecutivos com IES < 50
    const [iesBaixoConsec, setIesBaixoConsec] = useState(0);

    const getBarColor = (value: number) => {
        if (value <= 60) return "oklch(70.4% 0.191 22.216)";
        if (value > 60 && value < 85) return "oklch(85.2% 0.199 91.936)";
        return "oklch(79.2% 0.209 151.711)";
    };

    const getColorMetric = (metric: number, isCheckIn: boolean) => {
        // if(!isCheckIn) return 'text-gray-400'; 

        if (metric <= 60) return "text-red-400";
        if (metric > 60 && metric < 85) return "text-yellow-400";
        return "text-green-400";
    };

    const getAll = async (currentPeriod: string) => {
        try {
            if(currentPeriod.toLowerCase() == "personalizado") return;
            
            const { data } = await api.get(`/vitals/beneficiary/${currentPeriod.toLowerCase()}`, configApi());
            const result = data.result.data;

            if (!result.id) {
                setIsCheckIn(true);
            }

            const depressionScore = (result.dass1 || 0) + (result.dass2 || 0) + (result.dass3 || 0);
            const anxietyScore = (result.dass4 || 0) + (result.dass5 || 0) + (result.dass6 || 0);
            const stressScore = (result.dass7 || 0) + (result.dass8 || 0) + (result.dass9 || 0);

            setDass9({
                depression: depressionScore,
                anxiety: anxietyScore,
                stress: stressScore
            });
            console.log(result)
            setMetric(result.metric);
            setMetricWeek(result.weekMetric);
            setCheckIES(result.chekinIES);
            // Pauta 11+12: dias consecutivos com IES < 50 vem da API
            if (result.iesBaixoConsec !== undefined) {
                setIesBaixoConsec(result.iesBaixoConsec);
            }
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getLogged = async () => {
        try {
            const { data } = await api.get(`/customer-recipients/logged`, configApi());
            const result = data.result.data;
            const isRefresh = isTokenExpiringSoon();
            
            if(!isRefresh) {
                const refreshToken = localStorage.getItem("appRefreshToken");
                const { data } = await api.post(`/auth/refresh-token/app`, {}, {
                    headers: {
                        Authorization: `Bearer ${refreshToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                const newData = data.data;
                localStorage.setItem("appToken", newData.token);
                localStorage.setItem("appRefreshToken", newData.refreshToken);
                localStorage.setItem("appExpires", newData.expires);
            };

            if (result.telemedicine?.date) {
                setNextTelemedicine(result.telemedicine);
            }
        } catch (error) {
            resolveResponse(error);
        }
    };

    const activeNotification = async () => {
        try {
            if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

            const permission = await Notification.requestPermission();
            if (permission !== "granted") return;

            const registration = await navigator.serviceWorker.ready;

            let sub = await registration.pushManager.getSubscription();

            if (!sub) {
                const publicKey = "BKAi4Ae35cMd0JtCRVgIuHq6tjlqaN0Va0AifE1OzuldnKWkoGILA1F5qRr6iYOh6rcKr_3cp14qEFeNmp6olhs";
                sub = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey)
                });
            }

            await api.put(`/customer-recipients/sub-notification`, sub, configApi());
        } catch (error) {
            console.error("Push registration error:", error);
        }
    };

    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/aplicativo/sw.js").then((_) => {}).catch((err) => console.error("SW register error:", err));
        }
    }, []);

    useEffect(() => {
        if (!ready) return;
        
        // Pauta 11: CVV só aparece na HOME se IES < 50 por 3+ dias consecutivos
        if (checkIES && !isCheckIn && metric.ies <= 50 && iesBaixoConsec >= 3) {
            setCVV(true);
        } else {
            setCVV(false);
        }

        // Pauta 12: indicar uso do PAD se IES < 50 por 2+ dias consecutivos
        if (checkIES && !isCheckIn && metric.ies <= 50 && iesBaixoConsec >= 2) {
            setPAD(true);
        } else {
            setPAD(false);
        }
    }, [isCheckIn, nextTelemedicine, metric, ready, checkIES, iesBaixoConsec]);

    useEffect(() => {
        const initial = async () => {
            setIsLoading(true);
            await getAll(periodo);
            await getLogged();
            setIsLoading(false);
            setReady(true); 
            activeNotification();
        };
        initial();
    }, [isCheckIn, periodo]);

    return (
        <div className={`${montserrat.className}`}>
            {modal ? <VitalModal /> : (
                <div className="max-h-[calc(100dvh-13rem)] overflow-y-auto px-1">
                    <RankingPreview />

                    {cvv && (
                        <div className="mb-4 w-full p-2 bg-red-50 border border-red-200 rounded-2xl flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <FiAlertTriangle className="text-red-400" size={20} />
                                <span className="text-red-400 font-bold text-sm">Precisando de apoio?</span>
                            </div>
                            <a href="tel:188" className="w-full py-3 bg-red-600 rounded-2xl flex items-center justify-center gap-3 text-white font-bold">
                                <FiPhone size={20} /> Ligar 188 - CVV (24h)
                            </a>
                        </div>
                    )}

                    {/* Pauta 12: card PAD após 2 dias consecutivos com IES < 50 */}
                    {pad && !cvv && (
                        <div className="mb-4 w-full p-3 bg-orange-50 border border-orange-200 rounded-2xl flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <FiAlertTriangle className="text-orange-400" size={20} />
                                <span className="text-orange-400 font-bold text-sm">Atenção ao seu bem-estar emocional</span>
                            </div>
                            <p className="text-orange-600 text-xs leading-relaxed">
                                Identificamos que você pode se beneficiar de um suporte adicional. Conheça o <strong>PAD — Programa de Apoio e Desenvolvimento</strong>.
                            </p>
                            <a href="tel:188" className="w-full py-2.5 bg-orange-500 rounded-2xl flex items-center justify-center gap-3 text-white font-bold text-sm">
                                <FiPhone size={16} /> Falar com o PAD
                            </a>
                        </div>
                    )}
                    
                    {
                        nextTelemedicine.date &&
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-4 flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <FaVideo className="text-brand-500" size={20} />
                                <span className="text-brand-500 font-bold text-sm">
                                    Próxima consulta - {maskDate(nextTelemedicine.date)}
                                </span>
                            </div>
                        
                            <span className="text-brand-500 font-bold text-sm">
                                Horario: {nextTelemedicine.from} até {nextTelemedicine.to}
                            </span>
                            <span className="text-brand-500 font-bold text-sm">
                                Especialidade: {nextTelemedicine.specialty}
                            </span>
                            <span className="text-brand-500 font-bold text-sm">
                                Profissional: {nextTelemedicine.professional}
                            </span>

                            <div className="bg-brand-500 border-brand-500 mt-2 w-full py-2 rounded-2xl flex items-center justify-center gap-2 border shadow-sm">
                                <Link href={nextTelemedicine.beneficiaryUrl}>
                                    <span className="text-brand-100 font-bold text-sm">
                                        Acessar consulta
                                    </span>
                                </Link>
                            </div>
                        </div>
                    }

                    <div className="flex bg-gray-100 p-1 rounded-2xl mb-4 gap-1">
                        {['Semana', 'Mes', 'Ano', 'Personalizado'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriodo(p)}
                                className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all ${periodo === p ? 'bg-white text-brand-500 shadow-sm' : 'text-gray-400'}`}>
                                {p}
                            </button>
                        ))}
                    </div>

                    <div className="bg-brand-500 p-6 rounded-2xl border border-brand-200 mb-4">
                        <IpvGauge ipv={metric.ipv} />

                        <div className="border-t border-brand-100 my-4" />

                        {/* Pauta 4: legendas dos KPIs | Pauta 5: cards clicáveis */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'IGS', value: metric.igs, legend: 'Sono',    insight: metric.igs < 70 ? 'Privação de sono detectada. Isso reduz sua imunidade e foco.' : 'Boa qualidade de repouso. Continue mantendo sua rotina!', dose: metric.igs < 70 ? 'Desligue telas 30 min antes de dormir e mantenha horário fixo.' : 'Manter rotina de sono consistente.' },
                                { label: 'IGN', value: metric.ign, legend: 'Nutrição', insight: metric.ign < 70 ? 'Impacto glicêmico e horários sobrecarregando seu metabolismo.' : 'Metabolismo em equilíbrio!', dose: metric.ign < 70 ? 'Alinhe horários de refeição e reduza carga glicêmica.' : 'Seguir plano alimentar atual.' },
                                { label: 'IES', value: metric.ies, legend: 'Mental',  insight: metric.ies < 70 ? 'Nível de tensão emocional elevado detectado.' : 'Saúde emocional resiliente hoje!', dose: metric.ies < 70 ? 'Pratique 5 min de respiração profunda (4-7-8).' : 'Continue cultivando seu equilíbrio emocional.' },
                            ].map(({ label, value, legend, insight, dose }) => {
                                const bg    = value <= 60 ? '#FCEBEB' : value < 85 ? '#FAEEDA' : '#E1F5EE';
                                const color = value <= 60 ? '#E24B4A' : value < 85 ? '#BA7517' : '#1D9E75';
                                const sub   = value <= 60 ? '#A32D2D' : value < 85 ? '#854F0B' : '#0F6E56';
                                const borderColor = value <= 60 ? '#F09595' : value < 85 ? '#FAC775' : '#9FE1CB';
                                return (
                                    <button
                                        key={label}
                                        type="button"
                                        onClick={() => setActiveKpi(activeKpi === label ? null : label)}
                                        className="flex flex-col items-center py-3 rounded-2xl transition-all active:scale-95"
                                        style={{ background: bg, border: activeKpi === label ? `2px solid ${borderColor}` : '2px solid transparent' }}
                                    >
                                        {/* Pauta 4: legenda abaixo da sigla */}
                                        <span className="text-[10px] font-bold tracking-widest mb-0.5" style={{ color: sub }}>{label}</span>
                                        <span className="text-[9px] font-medium mb-1" style={{ color: sub }}>{legend}</span>
                                        <span className="text-xl font-bold" style={{ color }}>{Math.round(value)}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Pauta 5: painel de insight + dose que expande ao clicar no card */}
                        {activeKpi && (() => {
                            const kpiMap: Record<string, { value: number; legend: string; insight: string; dose: string }> = {
                                IGS: { value: metric.igs, legend: 'Sono',    insight: metric.igs < 70 ? 'Privação de sono detectada. Isso reduz sua imunidade e foco.' : 'Boa qualidade de repouso. Continue mantendo sua rotina!', dose: metric.igs < 70 ? 'Desligue telas 30 min antes de dormir e mantenha horário fixo.' : 'Manter rotina de sono consistente.' },
                                IGN: { value: metric.ign, legend: 'Nutrição', insight: metric.ign < 70 ? 'Impacto glicêmico e horários sobrecarregando seu metabolismo.' : 'Metabolismo em equilíbrio!', dose: metric.ign < 70 ? 'Alinhe horários de refeição e reduza carga glicêmica.' : 'Seguir plano alimentar atual.' },
                                IES: { value: metric.ies, legend: 'Mental',  insight: metric.ies < 70 ? 'Nível de tensão emocional elevado detectado.' : 'Saúde emocional resiliente hoje!', dose: metric.ies < 70 ? 'Pratique 5 min de respiração profunda (4-7-8).' : 'Continue cultivando seu equilíbrio emocional.' },
                            };
                            const k = kpiMap[activeKpi];
                            const color = k.value <= 60 ? '#E24B4A' : k.value < 85 ? '#BA7517' : '#1D9E75';
                            const bg    = k.value <= 60 ? '#FCEBEB' : k.value < 85 ? '#FAEEDA' : '#E1F5EE';
                            const border= k.value <= 60 ? '#F09595' : k.value < 85 ? '#FAC775' : '#9FE1CB';
                            return (
                                <div className="mt-3 rounded-2xl overflow-hidden animate-in slide-in-from-top duration-200">
                                    <div className="p-3 flex flex-col gap-2" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-white/80">💡 Insight — {k.legend}</span>
                                        </div>
                                        <p className="text-xs text-white/90 leading-relaxed">{k.insight}</p>
                                        <div className="h-px bg-white/10 my-1" />
                                        <span className="text-xs font-bold text-white/80">💊 Dose de Saúde</span>
                                        <p className="text-xs text-white/90 leading-relaxed">{k.dose}</p>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                    
                    {
                        periodo == "Personalizado" &&
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="col-span-1">
                                <Label label="Data Inicial" required={false}/>
                                <Input type="date" onInput={(e: any) => setStartDate(e.target.value)} />
                            </div>
                            <div className="col-span-1">
                                <Label label="Data Final" required={false}/>
                                <Input type="date" onInput={(e: any) => setEndDate(e.target.value)} />
                            </div>
                            <Button onClick={() => {
                                getAll(`${startDate}&${endDate}`);
                            }} type="button" variant="secondary" className="col-span-2" size="sm">Buscar</Button>
                        </div>
                    }

                    {metric.ipv > 0 && (
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 mb-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-5 rounded-full bg-brand-500" />
                                <span className="text-sm font-bold text-brand-500 tracking-wide">Saúde Mental 🧠</span>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { label: 'Depressão', value: dass9.depression, icon: '🧠' },
                                    { label: 'Ansiedade', value: dass9.anxiety,   icon: '💭' },
                                    { label: 'Estresse',  value: dass9.stress,    icon: '⚡' },
                                ].map(({ label, value, icon }) => {
                                    // Pauta 6: thresholds e nomenclatura de níveis ajustados
                                    const isAlert = value >= 8;
                                    const isHigh  = value >= 5 && value < 8;
                                    const isMid   = value >= 3 && value < 5;
                                    const isOk    = value < 3;

                                    const bg     = isAlert ? '#FCEBEB' : isHigh ? '#FEF3F2' : isMid ? '#FAEEDA' : '#E1F5EE';
                                    const border = isAlert ? '#F09595' : isHigh ? '#FCA5A5' : isMid ? '#FAC775' : '#9FE1CB';
                                    const color  = isAlert ? '#A32D2D' : isHigh ? '#C0392B' : isMid ? '#854F0B' : '#0F6E56';
                                    const badge  = isAlert ? '#E24B4A' : isHigh ? '#E74C3C' : isMid ? '#EF9F27' : '#1D9E75';
                                    const badgeBg= isAlert ? '#FCEBEB' : isHigh ? '#FEF3F2' : isMid ? '#FAEEDA' : '#E1F5EE';
                                    // Pauta 6: rótulos de nível mais claros
                                    const status = isAlert ? '🔴 Crítico' : isHigh ? '🟠 Elevado' : isMid ? '🟡 Moderado' : '🟢 Normal';

                                    const pct = Math.min((value / 12) * 100, 100);

                                    return (
                                        <div
                                            key={label}
                                            className="rounded-2xl p-4 flex flex-col gap-3"
                                            style={{ background: bg, border: `1px solid ${border}` }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span style={{ fontSize: 16 }}>{icon}</span>
                                                    <span className="text-sm font-bold" style={{ color }}>{label}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                        style={{ background: badgeBg, color: badge, border: `1px solid ${border}` }}
                                                    >
                                                        {status}
                                                    </span>
                                                    <span className="text-lg font-bold" style={{ color: badge }}>{value}</span>
                                                </div>
                                            </div>

                                            <div className="w-full h-1.5 rounded-full" style={{ background: border }}>
                                                <div
                                                    className="h-1.5 rounded-full transition-all duration-700"
                                                    style={{ width: `${pct}%`, background: badge }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-brand-500">Evolução</h3>
                            <div className="flex gap-2 text-[10px] font-medium text-gray-500">
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400" /> &gt;85</span>
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400" /> 60-85</span>
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400" /> &lt;60</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-brand-500 p-6 rounded-2xl border border-gray-200 mb-4">
                        <div className="h-56 w-full">
                            <LollipopChart data={metricWeek} periodo={periodo} />
                        </div>
                    </div>
                    
                    <div className="bg-brand-500 p-6 rounded-2xl border border-gray-200 mb-4">
                        <div className="h-56 w-full">
                            <LineChartCustom data={metricWeek} periodo={periodo} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-4 hidden">
                        <div className="relative h-48 w-48 mx-auto mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData} innerRadius={60} outerRadius={80} startAngle={90} endAngle={-270} dataKey="value">
                                        <Cell fill="#e2e8f0" stroke="none" />
                                        <Cell fill={getBarColor(metric.ipv)} stroke="none" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span style={{ color: getBarColor(metric.ipv) }} className="text-4xl font-bold">{metric.ipv}</span>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">IPV</span>
                            </div>
                        </div>
                        <div className="flex justify-center gap-8 mb-4">
                            <div className="text-center bg-gray-100 py-2 px-4 rounded-xl">
                                <p className={`text-[10px] font-bold ${getColorMetric(metric.igs, metric.chekinIGS)}`}>IGS</p>
                                <p className={`text-xl font-bold ${getColorMetric(metric.igs, metric.chekinIGS)}`}>{metric.igs}</p>
                            </div>
                            <div className="text-center bg-gray-100 py-2 px-4 rounded-xl">
                                <p className={`text-[10px] font-bold ${getColorMetric(metric.ign, metric.chekinIGN)}`}>IGN</p>
                                <p className={`text-xl font-bold ${getColorMetric(metric.ign, metric.chekinIGN)}`}>{metric.ign}</p>
                            </div>
                            <div className="text-center bg-gray-100 py-2 px-4 rounded-xl">
                                <p className={`text-[10px] font-bold ${getColorMetric(metric.ies, metric.chekinIES)}`}>IES</p>
                                <p className={`text-xl font-bold ${getColorMetric(metric.ies, metric.chekinIES)}`}>{metric.ies}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}