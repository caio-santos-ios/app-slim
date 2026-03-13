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
    const [ready, setReady] = useState(false);

    const getBarColor = (value: number) => {
        if (value <= 60) return "oklch(70.4% 0.191 22.216)";
        if (value > 60 && value < 85) return "oklch(85.2% 0.199 91.936)";
        return "oklch(79.2% 0.209 151.711)";
    };

    const getColorMetric = (metric: number) => {
        if (metric <= 60) return "text-red-400";
        if (metric > 60 && metric < 85) return "text-yellow-400";
        return "text-green-400";
    };

    const getColorDass9 = (scoore: number) => {
        if (scoore > 5) return "border bg-red-100 text-red-600 border-red-600";
        if (scoore >= 3 && scoore < 5) return "border bg-yellow-100 text-yellow-600 border-yellow-600";
        return "border bg-green-100 text-green-600 border-green-600";
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

            setMetric(result.metric);
            setMetricWeek(result.weekMetric);
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

    const GetBarColor = (metric: number) => {
        if (metric <= 60) return "#ff6467";
        if (metric > 60 && metric < 85) return "#fdc700";
        return "#06df72";
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
            navigator.serviceWorker.register("/aplicativo/sw.js").then((_) => {
            }).catch((err) => console.error("SW register error:", err));
        }
    }, []);

    useEffect(() => {
        if (!ready) return;
        
        if (!isCheckIn && !nextTelemedicine.date && metric.ies <= 60) {
            setCVV(true);
        } else {
            setCVV(false);
        }
    }, [isCheckIn, nextTelemedicine, metric, ready]);

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

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-4">
                        <IpvGauge ipv={metric.ipv} />

                        <div className="border-t border-gray-100 my-4" />

                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'IGS', value: metric.igs },
                                { label: 'IGN', value: metric.ign },
                                { label: 'IES', value: metric.ies },
                            ].map(({ label, value }) => {
                                const bg    = value <= 60 ? '#FCEBEB' : value < 85 ? '#FAEEDA' : '#E1F5EE';
                                const color = value <= 60 ? '#E24B4A' : value < 85 ? '#BA7517' : '#1D9E75';
                                const sub   = value <= 60 ? '#A32D2D' : value < 85 ? '#854F0B' : '#0F6E56';
                                return (
                                    <div key={label} className="flex flex-col items-center py-3 rounded-2xl" style={{ background: bg }}>
                                        <span className="text-[10px] font-bold tracking-widest mb-1" style={{ color: sub }}>{label}</span>
                                        <span className="text-xl font-bold" style={{ color }}>{Math.round(value)}</span>
                                    </div>
                                );
                            })}
                        </div>
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
                                <span className="text-sm font-bold text-brand-500 tracking-wide">Saúde Mental</span>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { label: 'Depressão', value: dass9.depression, icon: '🧠' },
                                    { label: 'Ansiedade', value: dass9.anxiety,   icon: '💭' },
                                    { label: 'Estresse',  value: dass9.stress,    icon: '⚡' },
                                ].map(({ label, value, icon }) => {
                                    const isAlert  = value > 5;
                                    const isMid    = value >= 3 && value <= 5;
                                    const isOk     = value < 3;

                                    const bg      = isAlert ? '#FCEBEB' : isMid ? '#FAEEDA' : '#E1F5EE';
                                    const border  = isAlert ? '#F09595' : isMid ? '#FAC775' : '#9FE1CB';
                                    const color   = isAlert ? '#A32D2D' : isMid ? '#854F0B' : '#0F6E56';
                                    const badge   = isAlert ? '#E24B4A' : isMid ? '#EF9F27' : '#1D9E75';
                                    const badgeBg = isAlert ? '#FCEBEB' : isMid ? '#FAEEDA' : '#E1F5EE';
                                    const status  = isAlert ? 'Atenção' : isMid ? 'Moderado' : 'Normal';

                                    const pct = Math.min((value / 9) * 100, 100);

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

                                            {/* Barra de progresso */}
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
                                <p className={`text-[10px] font-bold ${getColorMetric(metric.igs)}`}>IGS</p>
                                <p className={`text-xl font-bold ${getColorMetric(metric.igs)}`}>{metric.igs}</p>
                            </div>
                            <div className="text-center bg-gray-100 py-2 px-4 rounded-xl">
                                <p className={`text-[10px] font-bold ${getColorMetric(metric.ign)}`}>IGN</p>
                                <p className={`text-xl font-bold ${getColorMetric(metric.ign)}`}>{metric.ign}</p>
                            </div>
                            <div className="text-center bg-gray-100 py-2 px-4 rounded-xl">
                                <p className={`text-[10px] font-bold ${getColorMetric(metric.ies)}`}>IES</p>
                                <p className={`text-xl font-bold ${getColorMetric(metric.ies)}`}>{metric.ies}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}