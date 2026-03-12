"use client";

import { useAtom } from "jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import VitalModal from "../vital-modal/VitalModal";
import { VitalCheckInAtom, VitalModalAtom } from "@/jotai/vital/vital.jotai";
import { configApi, isTokenExpiringSoon, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie, LabelList, LineChart, Line } from 'recharts';
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

                    {/* {!isCheckIn && !nextTelemedicine.date && metric.ies <= 60 && (
                        <div className="mb-4 w-full p-2 bg-red-50 border border-red-200 rounded-2xl flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <FiAlertTriangle className="text-red-400" size={20} />
                                <span className="text-red-400 font-bold text-sm">Precisando de apoio?</span>
                            </div>
                            <a href="tel:188" className="w-full py-3 bg-red-600 rounded-2xl flex items-center justify-center gap-3 text-white font-bold">
                                <FiPhone size={20} /> Ligar 188 - CVV (24h)
                            </a>
                        </div>
                    )} */}
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

                    {
                        metric.ipv > 0 &&
                        <ul  className={`bg-white p-6 rounded-2xl border border-gray-200 mb-4 grid grid-cols-1 gap-4`}>
                            <li className={`${getColorDass9(dass9.depression)} rounded-2xl p-4 flex justify-between`}>
                                <span className="text-md font-semibold">Depressão</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{dass9.depression}</span>
                                </div>
                            </li>
                            <li className={`${getColorDass9(dass9.stress)} rounded-2xl p-4 flex justify-between`}>
                                <span className="text-md font-semibold">Ansiedade</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{dass9.stress}</span>
                                </div>
                            </li>
                            <li className={`${getColorDass9(dass9.anxiety)} rounded-2xl p-4 flex justify-between`}>
                                <span className="text-md font-semibold">Estresse</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{dass9.anxiety}</span>
                                </div>
                            </li>                    
                        </ul>
                    }

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-brand-500">Evolução</h3>
                            <div className="flex gap-2 text-[10px] font-medium text-gray-500">
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400" /> &gt;85</span>
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400" /> 60-85</span>
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400" /> &lt;60</span>
                            </div>
                        </div>

                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart 
                                    key={periodo}
                                    data={metricWeek} 
                                    margin={{ top: 10, bottom: 10, left: 0, right: 10 }}
                                >
                                    <XAxis 
                                        dataKey="day" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                                        interval={periodo === 'Semana' ? 0 : 'preserveStartEnd'}
                                        tickFormatter={(val) => {
                                            if (periodo === 'Semana') return val;
                                            if (periodo === 'Mes') return val.includes('/') ? val.split('/')[0] : val;
                                            if (periodo === 'Ano') return val.substring(0, 3);
                                            return val;
                                        }}
                                    />
                                    <YAxis 
                                        domain={[0, 100]}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                                        width={30}
                                    />
                                    <Line 
                                        dataKey="ipv" 
                                        type="monotone"
                                        strokeWidth={2}
                                        dot={(props: any) => {
                                            const { cx, cy, index } = props;
                                            const data = metricWeek[index];
                                            return (
                                                <circle 
                                                    key={`dot-${index}`}
                                                    cx={cx} 
                                                    cy={cy} 
                                                    r={periodo === 'Semana' ? 6 : periodo === 'Mes' ? 4 : 3} 
                                                    fill={GetBarColor(data?.ipv)} 
                                                    stroke="#1e293b" 
                                                    strokeWidth={2} 
                                                />
                                            );
                                        }}
                                        activeDot={{ r: 8 }}
                                        stroke="#94a3b8"
                                        label={periodo === 'Semana' ? {
                                            content: (props: any) => {
                                                const { x, y, index } = props;
                                                const data = metricWeek[index!];
                                                return (
                                                    <g>
                                                        <text x={x} y={y - 12} fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">{data.ipv.toFixed(0)}%</text>
                                                    </g>
                                                );
                                            }
                                        } : undefined}
                                    />
                                </LineChart>
                                {/* <BarChart 
                                    key={periodo} // FORÇA A ATUALIZAÇÃO DO GRÁFICO
                                    data={metricWeek} 
                                    margin={{ top: 10, bottom: 10 }}
                                >
                                    <XAxis 
                                        dataKey="day" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                                        interval={periodo === 'Semana' ? 0 : 'preserveStartEnd'}
                                        tickFormatter={(val) => {
                                            // Lógica de limpeza da label baseada no período
                                            if (periodo === 'Semana') return val;
                                            if (periodo === 'Mes') return val.includes('/') ? val.split('/')[0] : val;
                                            if (periodo === 'Ano') return val.substring(0, 3);
                                            return val;
                                        }}
                                    />
                                    <YAxis hide domain={[0, 100]} />
                                    <Bar 
                                        dataKey="ipv" 
                                        radius={[10, 10, 10, 10]} 
                                        barSize={
                                            periodo === 'Semana' ? 40 : 
                                            periodo === 'Mes' ? 12 : 
                                            periodo === 'Ano' ? 8 : 4
                                        }
                                    >
                                        {metricWeek.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={GetBarColor(entry.ipv)} />
                                        ))}

                                        {periodo === 'Semana' && (
                                            <LabelList
                                                dataKey="ipv"
                                                content={(props: any) => {
                                                    const { x, y, width, height, index } = props;
                                                    const data = metricWeek[index!];
                                                    if (!height || Number(height) < 60) return null;
                                                    const centerX = Number(x) + Number(width) / 2;
                                                    const startY = Number(y) + 20;
                                                    return (
                                                        <g>
                                                            <text x={centerX} y={startY} fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">{data.ipv.toFixed(0)}%</text>
                                                            <line x1={Number(x) + 5} y1={startY + 5} x2={Number(x) + Number(width) - 5} y2={startY + 5} stroke="rgba(255,255,255,0.3)" />
                                                            <text x={centerX} y={startY + 15} fill="#fff" fontSize="8" textAnchor="middle">S:{data.igs.toFixed(0)}</text>
                                                            <text x={centerX} y={startY + 25} fill="#fff" fontSize="8" textAnchor="middle">N:{data.ign.toFixed(0)}</text>
                                                            <text x={centerX} y={startY + 35} fill="#fff" fontSize="8" textAnchor="middle">M:{data.ies.toFixed(0)}</text>
                                                        </g>
                                                    );
                                                }}
                                            />
                                        )}
                                    </Bar>
                                </BarChart> */}
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-4">
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