"use client";

import { useAtom } from "jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import VitalModal from "../vital-modal/VitalModal";
import { VitalModalAtom } from "@/jotai/vital/vital.jotai";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie, } from 'recharts';
import { FiAlertTriangle, FiPhone } from "react-icons/fi";
import { HiOutlineLightBulb } from "react-icons/hi";

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

export default function Vital() {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [modal, setModal] = useAtom(VitalModalAtom);

    const getBarColor = (value: number) => {
        if (value > 85) return "#4ade80"; // Verde
        if (value >= 60) return "#f59e0b"; // Laranja
        return "#ef4444"; // Vermelho
    };

    const getAll = async () => {
        try {
            setIsLoading(true);
            const {data} = await api.get(`/vitals/beneficiary`, configApi());
            const result = data.result.data;

            if(result == null) {
                setModal(true);
            } else {
                console.log(result.Metric)
            }
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getColor = (scoore: number) => {
        // if(scoore < 60)
        // abaixo de 60
        // oklch(79.5% 0.184 86.047)
        // oklch(57.7% 0.245 27.325)
        // oklch(62.7% 0.194 149.214)
    };

    useEffect(() => {
        const initial = async () => {
            await getAll();
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
                    <h1 className="mb-1.5 block text-md font-bold text-brand-400">Bem Vital</h1>
                    <div className="max-h-[calc(100dvh-9rem)] overflow-y-auto">
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
                                            dataKey="value"
                                        >
                                            <Cell fill="#e2e8f0" stroke="none" />
                                            <Cell fill="#457091" stroke="none" /> 
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-bold text-brand-400">{10}</span>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">IPV</span>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <button className="bg-red-400 text-white px-8 py-1.5 rounded-full text-sm font-bold mb-6">
                                    Alerta
                                </button>
                            </div>

                            <div className="flex justify-center gap-8 mb-4">
                                <div className="text-center bg-gray-200 p-2 rounded-lg">
                                    <p className="text-[10px] text-gray-400 font-bold">IGS</p>
                                    <p className="text-xl font-bold text-brand-500">{10}</p>
                                </div>
                                <div className="text-center bg-gray-200 p-2 rounded-lg">
                                    <p className="text-[10px] text-gray-400 font-bold">IGN</p>
                                    <p className="text-xl font-bold text-brand-500">{20}</p>
                                    </div>
                                <div className="text-center bg-gray-200 p-2 rounded-lg">
                                    <p className="text-[10px] text-gray-400 font-bold">IES</p>
                                    <p className="text-xl font-bold text-brand-500">{90}</p>
                                </div>
                            </div>
                            
                            <p className="text-[10px] text-gray-400 font-medium leading-tight text-center">
                                Índice de Performance Vital<br/>Média de IGS + IGN + IES
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-(--color-brand-400)">Evolução Semanal</h3>
                                <div className="flex gap-2 text-[10px] font-medium text-gray-500">
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400" /> &gt;85</span>
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400" /> 60-85</span>
                                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400" /> &lt;60</span>
                                </div>
                            </div>
                            
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                        <YAxis hide domain={[0, 100]} />
                                        <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={50}>
                                            {data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                    {/* <BarChart data={metricWeek}>
                                        <XAxis dataKey="day" />
                                        <Bar dataKey="ipv">
                                            {metricWeek.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.ipv > 85 ? '#4ade80' : '#ef4444'} />
                                            ))}
                                        </Bar>
                                    </BarChart> */}
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* <div className="w-full p-5 bg-green-900/10 border border-green-800 rounded-3xl flex flex-col gap-2">
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

                            <div className="bg-green-700 border-green-800 mt-2 w-full py-3 rounded-2xl flex items-center justify-center gap-2 border shadow-sm">
                                <span className="text-blue-950 dark:text-blue-100 font-bold text-sm">
                                    Fazer Check-in
                                </span>
                            </div>
                        </div> */}
                    </div>
                </div>
            }
        </div>
    );
}