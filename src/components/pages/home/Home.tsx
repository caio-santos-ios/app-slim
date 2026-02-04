"use client";

import { useAtom } from "jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import VitalModal from "../vital-modal/VitalModal";
import { VitalCheckInAtom, VitalModalAtom } from "@/jotai/vital/vital.jotai";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie, LabelList, } from 'recharts';
import { FiAlertTriangle, FiPhone } from "react-icons/fi";
import { HiOutlineLightBulb } from "react-icons/hi";
import { FaExternalLinkAlt, FaVideo } from "react-icons/fa";
import { maskDate } from "@/utils/mask.util";

const data = [
    { name: 'quarta', value: 75 },
    { name: 'quarta', value: 50 },
    { name: 'quarta', value: 72 },
    { name: 'quinta', value: 73 },
];

const chartData = [
    { value: 10 },
    { value: 100 - 10 }
];

export default function Home() {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [modal, setModal] = useAtom(VitalModalAtom);
    const [isCheckIn, setIsCheckIn] = useAtom(VitalCheckInAtom);
    const [nextTelemedicine, setNextTelemedicine] = useState<any>({date: ""});
    const [metric, setMetric] = useState<any>({igs: 0, ign: 0, ies: 0, ipv: 0});
    const [metricWeek, setMetricWeek] = useState<any[]>([]);
    const [periodo, setPeriodo] = useState('Semana');
    const periodos = ['Semana', 'Mês', 'Ano', 'Todo Período'];

    const getBarColor = (value: number) => {
        if (value <= 60) return "oklch(70.4% 0.191 22.216)";
        if (value > 60 && value < 85) return "oklch(85.2% 0.199 91.936)";
        return "oklch(70.4% 0.191 22.216)";
    };
    
    const getColorMetric = (metric: number) => {
        if (metric <= 60) return "text-red-400";
        if (metric > 60 && metric < 85) return "text-yellow-400";
        return "text-green-400";
    };

    const getAll = async () => {
        try {
            const {data} = await api.get(`/vitals/beneficiary`, configApi());
            const result = data.result.data;

            if(!result.id) {
                setIsCheckIn(true);
            };
            
            setMetric(result.metric);
            setMetricWeek(result.weekMetric);
        } catch (error) {
            resolveResponse(error);
        }
    };
    
    const getLogged = async () => {
        try {
            const {data} = await api.get(`/customer-recipients/logged`, configApi());
            const result = data.result.data;
            if(result.telemedicine.date) {
                setNextTelemedicine(result.telemedicine);
            };
        } catch (error) {
            resolveResponse(error);
        }
    };

    useEffect(() => {
        const initial = async () => {
            setIsLoading(true);
            await getAll();
            await getLogged();
            setIsLoading(false);
        };
        initial();
    }, []);

    return (
        <div>
            {
                modal ?
                <VitalModal />
                :
                <div>
                    {/* <h1 className="mb-1.5 block text-md font-bold text-brand-400">PasBem</h1> */}
                    <div className="max-h-[calc(100dvh-13rem)] overflow-y-auto">
                        {
                            isCheckIn &&
                            <div onClick={() => setModal(true)} className="mb-3 w-full p-2 bg-green-900/10 border border-green-800 rounded-2xl flex flex-col gap-2">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-green-800 rounded-xl">
                                        <HiOutlineLightBulb className="text-green-600 dark:text-green-400" size={24} />
                                    </div>
                                    
                                    <div className="flex flex-col">
                                        <h3 className="text-green-800 font-bold text-lg leading-tight">
                                            Registre seu dia
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            Faça seu check-in diário para acompanhar sua evolução.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-green-700 border-green-800 mt-2 w-full py-2 rounded-2xl flex items-center justify-center gap-2 border shadow-sm">
                                    <span className="text-blue-950 dark:text-blue-100 font-bold text-sm">
                                        Fazer Check-in
                                    </span>
                                </div>
                            </div>
                        }

                        {
                            !isCheckIn && !nextTelemedicine.date && metric.ies <= 60 &&
                            <div className="mb-4 w-full p-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-400 rounded-2xl flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <FiAlertTriangle className="text-red-400" size={20} />
                                    <span className="text-red-400 font-bold text-sm">
                                    Precisando de apoio?
                                    </span>
                                </div>

                                <a href="tel:188" className="w-full py-3 bg-red-600 hover:bg-red-700 active:scale-95 transition-all rounded-2xl flex items-center justify-center gap-3 text-white font-bold" >
                                    <FiPhone size={20} />
                                    <span>Ligar 188 - CVV (24h)</span>
                                </a>
                            </div>
                        }
                        
                        {
                            nextTelemedicine.date &&
                            <div className="mb-4 w-full p-2 bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-400 rounded-2xl flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <FaVideo className="text-brand-400" size={20} />
                                    <span className="text-brand-400 font-bold text-sm">
                                        Próxima consulta - {maskDate(nextTelemedicine.date)}
                                    </span>
                                </div>
                                
                                <span className="text-brand-400 font-bold text-sm">
                                    Horario: {nextTelemedicine.to} até {nextTelemedicine.from}
                                </span>
                                <span className="text-brand-400 font-bold text-sm">
                                    Especialidade: {nextTelemedicine.specialty}
                                </span>
                                <span className="text-brand-400 font-bold text-sm">
                                    Profissional: {nextTelemedicine.professional}
                                </span>

                                <a href={`${nextTelemedicine.beneficiaryUrl}`} className="bg-brand-700 border-brand-800 text-white mt-2 w-full py-2 rounded-2xl flex items-center justify-center gap-2 border shadow-sm">
                                    <FaExternalLinkAlt size={20} />
                                    <span>Acessar consulta</span>
                                </a>
                            </div>
                        }
                        
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-4">
                            <div className="relative h-48 w-48 mx-auto mb-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            startAngle={90}
                                            endAngle={-270}
                                            paddingAngle={0}
                                            dataKey="value">
                                            
                                            <Cell fill="#e2e8f0" stroke="none" />
                                            <Cell fill={getBarColor(metric.ipv)} stroke="none" /> 
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span style={{color: getBarColor(metric.ipv)}} className="text-4xl font-bold">{metric.ipv}</span>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">IPV</span>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                {
                                    metric.ipv > 85 &&
                                    <button className="bg-green-400 text-white px-8 py-1.5 rounded-full text-sm font-bold mb-6">
                                        Excelente
                                    </button>
                                }
                                {
                                    metric.ipv > 60 && metric.ipv < 85 &&
                                    <button className="bg-yellow-400 text-white px-8 py-1.5 rounded-full text-sm font-bold mb-6">
                                        Atenção
                                    </button>
                                }
                                {
                                    metric.ipv < 60 &&
                                    <button className="bg-red-400 text-white px-8 py-1.5 rounded-full text-sm font-bold mb-6">
                                        Alerta
                                    </button>
                                }
                            </div>

                            <div className="flex justify-center gap-8 mb-4">
                                <div className="text-center bg-gray-200 py-2 px-3 rounded-lg">
                                    <p className={`text-[10px] font-bold ${getColorMetric(metric.igs)}`}>IGS</p>
                                    <p className={`text-xl font-bold ${getColorMetric(metric.igs)}`}>{metric.igs}</p>
                                </div>
                                <div className="text-center bg-gray-200 py-2 px-3 rounded-lg">
                                    <p className={`text-[10px] font-bold ${getColorMetric(metric.ign)}`}>IGN</p>
                                    <p className={`text-xl font-bold ${getColorMetric(metric.ign)}`}>{metric.ign}</p>
                                    </div>
                                <div className="text-center bg-gray-200 py-2 px-3 rounded-lg">
                                    <p className={`text-[10px] font-bold ${getColorMetric(metric.ies)}`}>IES</p>
                                    <p className={`text-xl font-bold ${getColorMetric(metric.ies)}`}>{metric.ies}</p>
                                </div>
                            </div>
                            
                            <p className="text-[10px] text-gray-400 font-medium leading-tight text-center">
                                Índice de Performance Vital<br/>Média de IGS + IGN + IES
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-(--color-brand-400)">Evolução</h3>
                                <div className="flex gap-2 text-[10px] font-medium text-gray-500">
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400" /> &gt;85</span>
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400" /> 60-85</span>
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400" /> &lt;60</span>
                                </div>
                            </div>
                            
                            {/* <div className="flex bg-gray-50 dark:bg-slate-800 p-1 rounded-xl mb-6 overflow-x-auto no-scrollbar">
                                {periodos.map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPeriodo(p)}
                                        className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                                            periodo === p 
                                            ? 'bg-white dark:bg-slate-700 text-(--color-brand-400) shadow-sm' 
                                            : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div> */}

                            {/* <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={metricWeek} margin={{ top: 10, bottom: 10 }}>
                                        <XAxis 
                                            dataKey="day" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fill: '#94a3b8', fontSize: 12}}
                                        />
                                        <YAxis hide domain={[0, 100]} />
                                        
                                        <Bar dataKey="ipv" radius={[10, 10, 10, 10]} barSize={55}>
                                            {metricWeek.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.ipv > 85 ? '#4ade80' : entry.ipv >= 60 ? '#f59e0b' : '#ef4444'} 
                                            />
                                            ))}

                                            <LabelList
                                            dataKey="ipv"
                                            content={(props) => {
                                                const { x, y, width, height, index } = props;
                                                const data = metricWeek[index!];

                                                // Se a barra for muito baixa (altura < 60), não mostra os detalhes para não bugar
                                                if (!height || Number(height) < 60) return null;

                                                const centerX = Number(x) + Number(width) / 2;
                                                const startY = Number(y) + 20; // Começa um pouco abaixo do topo da barra

                                                return (
                                                <g>
                                                    <text x={centerX} y={startY} fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">
                                                        {data.ipv.toFixed(0)}%
                                                    </text>

                                                    <line x1={Number(x) + 10} y1={startY + 5} x2={Number(x) + Number(width) - 10} y2={startY + 5} stroke="rgba(255,255,255,0.3)" />

                                                    <text x={centerX} y={startY + 20} fill="#fff" fontSize="9" fontWeight="medium" textAnchor="middle">
                                                        S: {data.igs.toFixed(0)}
                                                    </text>
                                                    <text x={centerX} y={startY + 32} fill="#fff" fontSize="9" fontWeight="medium" textAnchor="middle">
                                                        N: {data.ign.toFixed(0)}
                                                    </text>
                                                    <text x={centerX} y={startY + 44} fill="#fff" fontSize="9" fontWeight="medium" textAnchor="middle">
                                                        M: {data.ies.toFixed(0)}
                                                    </text>
                                                </g>
                                                );
                                            }}
                                            />
                                        </Bar>
                                        </BarChart>
                                </ResponsiveContainer>
                            </div> */}

                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={metricWeek} margin={{ top: 10, bottom: 10 }}>
                                        <XAxis 
                                            dataKey="day" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fill: '#94a3b8', fontSize: 12}}
                                        />
                                        <YAxis hide domain={[0, 100]} />
                                        
                                        <Bar dataKey="ipv" radius={[10, 10, 10, 10]} barSize={periodo === 'Semana' ? 55 : 20}>
                                            {metricWeek.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={entry.ipv > 85 ? '#4ade80' : entry.ipv >= 60 ? '#f59e0b' : '#ef4444'} 
                                                />
                                            ))}

                                            <LabelList
                                                dataKey="ipv"
                                                content={(props) => {
                                                    const { x, y, width, height, index } = props;
                                                    const data = metricWeek[index!];

                                                    if (periodo !== 'Semana' || !height || Number(height) < 60) return null;

                                                    const centerX = Number(x) + Number(width) / 2;
                                                    const startY = Number(y) + 20;

                                                    return (
                                                        <g>
                                                            <text x={centerX} y={startY} fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">
                                                                {data.ipv.toFixed(0)}%
                                                            </text>
                                                            <line x1={Number(x) + 10} y1={startY + 5} x2={Number(x) + Number(width) - 10} y2={startY + 5} stroke="rgba(255,255,255,0.3)" />
                                                            <text x={centerX} y={startY + 20} fill="#fff" fontSize="9" fontWeight="medium" textAnchor="middle">S: {data.igs.toFixed(0)}</text>
                                                            <text x={centerX} y={startY + 32} fill="#fff" fontSize="9" fontWeight="medium" textAnchor="middle">N: {data.ign.toFixed(0)}</text>
                                                            <text x={centerX} y={startY + 44} fill="#fff" fontSize="9" fontWeight="medium" textAnchor="middle">M: {data.ies.toFixed(0)}</text>
                                                        </g>
                                                    );
                                                }}
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}