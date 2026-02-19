// "use client";

// import { useAtom } from "jotai";
// import { loadingAtom } from "@/jotai/global/loading.jotai";
// import VitalModal from "../vital-modal/VitalModal";
// import { VitalCheckInAtom, VitalModalAtom } from "@/jotai/vital/vital.jotai";
// import { configApi, resolveResponse } from "@/service/config.service";
// import { api } from "@/service/api.service";
// import { useEffect, useState } from "react";
// import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie, LabelList, } from 'recharts';
// import { FiAlertTriangle, FiPhone } from "react-icons/fi";
// import { HiOutlineLightBulb } from "react-icons/hi";
// import { FaVideo } from "react-icons/fa";
// import { maskDate } from "@/utils/mask.util";
// import { montserrat } from "../dass21/Dass21";

// const chartData = [
//     { value: 10 },
//     { value: 100 - 10 }
// ];

// export default function Home() {
//     const [_, setIsLoading] = useAtom(loadingAtom);
//     const [modal, setModal] = useAtom(VitalModalAtom);
//     const [isCheckIn, setIsCheckIn] = useAtom(VitalCheckInAtom);
//     const [nextTelemedicine, setNextTelemedicine] = useState<any>({date: ""});
//     const [metric, setMetric] = useState<any>({igs: 0, ign: 0, ies: 0, ipv: 0});
//     const [metricWeek, setMetricWeek] = useState<any[]>([]);
//     const [periodo, setPeriodo] = useState('Semana');
//     const [dass9, setDass9] = useState<any>({})

//     const getBarColor = (value: number) => {
//         if (value <= 60) return "oklch(70.4% 0.191 22.216)";
//         if (value > 60 && value < 85) return "oklch(85.2% 0.199 91.936)";
//         return "oklch(79.2% 0.209 151.711)";
//     };
    
//     const getColorMetric = (metric: number) => {
//         if (metric <= 60) return "text-red-400";
//         if (metric > 60 && metric < 85) return "text-yellow-400";
//         return "text-green-400";
//     };
    
//     const getColorDass9 = (scoore: number) => {
//         if (scoore > 5) return "border bg-red-100 text-red-600 border-red-600";
//         if (scoore >= 3 && scoore < 5) return "border bg-yellow-100 text-yellow-600 border-yellow-600";
//         return "border bg-green-100 text-green-600 border-green-600";
//     };

//     const getAll = async () => {
//         try {
//             const {data} = await api.get(`/vitals/beneficiary`, configApi());
//             const result = data.result.data;

//             if(!result.id) {
//                 setIsCheckIn(true);
//             };

//             const depressionScore = (result.dass1 || 0) + (result.dass2 || 0) + (result.dass3 || 0);
//             const anxietyScore = (result.dass4 || 0) + (result.dass5 || 0) + (result.dass6 || 0);
//             const stressScore = (result.dass7 || 0) + (result.dass8 || 0) + (result.dass9 || 0);

//             setDass9({
//                 depression: depressionScore,
//                 anxiety: anxietyScore,
//                 stress: stressScore
//             });

//             setMetric(result.metric);
//             setMetricWeek(result.weekMetric);
//         } catch (error) {
//             resolveResponse(error);
//         }
//     };
    
//     const getLogged = async () => {
//         try {
//             const {data} = await api.get(`/customer-recipients/logged`, configApi());
//             const result = data.result.data;
//             if(result.telemedicine.date) {
//                 setNextTelemedicine(result.telemedicine);
//             };
//         } catch (error) {
//             resolveResponse(error);
//         }
//     };

//     const GetBarColor = (metric: number) => {
//         if (metric <= 60) return "#ff6467";
//         if (metric > 60 && metric < 85) return "#fdc700";
//         return "#06df72";
//     };

//     useEffect(() => {
//         const initial = async () => {
//             setIsLoading(true);
//             await getAll();
//             await getLogged();
//             setIsLoading(false);
//         };
//         initial();
//     }, [isCheckIn, periodo]);

//     return (
//         <div className={`${montserrat.className}`}>
//             {
//                 modal ?
//                 <VitalModal />
//                 :
//                 <div>
//                     <div className="max-h-[calc(100dvh-13rem)] overflow-y-auto">
//                         <div className="flex bg-gray-100 p-1 rounded-2xl mb-6 gap-1">
//                             {['Semana', 'Mes', 'Ano', 'Todos'].map((item) => (
//                                 <button
//                                     key={item}
//                                     onClick={() => setPeriodo(item)}
//                                     className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all ${
//                                         periodo === item 
//                                         ? 'bg-white text-brand-500 shadow-sm' 
//                                         : 'text-gray-400 hover:text-gray-600'
//                                     }`}
//                                 >
//                                     {item === 'Todos' ? 'Tudo' : item}
//                                 </button>
//                             ))}
//                         </div>

//                         <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-4">
//                             <div className="flex justify-between items-center mb-6">
//                                 <h3 className="font-bold text-brand-500">Evolução</h3>
//                                 <div className="flex gap-2 text-[10px] font-medium text-gray-500">
//                                     <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400" /> &gt;85</span>
//                                     <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400" /> 60-85</span>
//                                     <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400" /> &lt;60</span>
//                                 </div>
//                             </div>
                            
//                             <div className="h-56 w-full">
//                                 <ResponsiveContainer width="100%" height="100%">
//                                     <BarChart key={periodo} data={metricWeek} margin={{ top: 10, bottom: 10 }}>
//                                         <XAxis 
//                         dataKey="day" 
//                         axisLine={false} 
//                         tickLine={false} 
//                         tick={{fill: '#94a3b8', fontSize: 10}}
//                         interval={periodo === 'Semana' ? 0 : 'preserveStartEnd'} 
//                         tickFormatter={(value) => {
//                             // Se o período não for semana, vamos tentar tratar o que vem do back
//                             if (periodo === 'Mes' || periodo === 'Ano' || periodo === 'Todos') {
//                                 // Se o valor for uma data ISO ou BR (Ex: 2024-03-01 ou 01/03)
//                                 if (value.includes('/')) return value.split('/')[0];
//                                 if (value.includes('-')) return value.split('-')[2];
                                
//                                 // Se o back enviar o nome do mês (Janeiro, Fevereiro...)
//                                 if (value.length > 3 && isNaN(value)) return value.substring(0, 3);
//                             }
//                             return value; 
//                         }}
//                     />
//                                         <YAxis hide domain={[0, 100]} />
                                        
//                                         {/* Ajuste dinâmico do barSize baseado no período */}
//                                         <Bar 
//                                             dataKey="ipv" 
//                                             radius={[6, 6, 6, 6]} 
//                                             barSize={
//                                                 periodo === 'Semana' ? 40 : 
//                                                 periodo === 'Mes' ? 12 : 
//                                                 periodo === 'Ano' ? 8 : 4
//                                             }
//                                         >
//                                             {metricWeek.map((entry, index) => (
//                                                 <Cell key={`cell-${index}`} fill={GetBarColor(entry.ipv)} />
//                                             ))}

//                                             {/* O LabelList só aparece na visão de Semana para não poluir */}
//                                             {periodo === 'Semana' && (
//                                                 <LabelList
//                                                     dataKey="ipv"
//                                                     content={(props: any) => {
//                                                         const { x, y, width, height, index } = props;
//                                                         const data = metricWeek[index!];
//                                                         if (!height || Number(height) < 50) return null;

//                                                         const centerX = Number(x) + Number(width) / 2;
//                                                         const startY = Number(y) + 15;

//                                                         return (
//                                                             <g>
//                                                                 <text x={centerX} y={startY} fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">
//                                                                     {data.ipv.toFixed(0)}%
//                                                                 </text>
//                                                                 <line x1={Number(x) + 5} y1={startY + 4} x2={Number(x) + Number(width) - 5} y2={startY + 4} stroke="rgba(255,255,255,0.4)" />
//                                                                 <text x={centerX} y={startY + 14} fill="#fff" fontSize="8" textAnchor="middle">S:{data.igs.toFixed(0)}</text>
//                                                                 <text x={centerX} y={startY + 24} fill="#fff" fontSize="8" textAnchor="middle">N:{data.ign.toFixed(0)}</text>
//                                                                 <text x={centerX} y={startY + 34} fill="#fff" fontSize="8" textAnchor="middle">M:{data.ies.toFixed(0)}</text>
//                                                             </g>
//                                                         );
//                                                     }}
//                                                 />
//                                             )}
//                                         </Bar>
//                                     </BarChart>
//                                 </ResponsiveContainer>
//                             </div>
//                         </div>
//                         {
//                             isCheckIn &&
//                             <div onClick={() => setModal(true)} className="w-full bg-white p-6 rounded-2xl border border-gray-200 mb-4 flex flex-col gap-2">
//                                 <div className="flex items-start gap-3">
//                                     <div className="p-2 bg-brand-2-500 rounded-xl">
//                                         <HiOutlineLightBulb className="text-brand-2-100" size={24} />
//                                     </div>
                                    
//                                     <div className="flex flex-col">
//                                         <h3 className="text-brand-2-500 font-bold text-lg leading-tight">
//                                             Registre seu dia
//                                         </h3>
//                                         <p className="text-gray-500 dark:text-gray-400 text-sm">
//                                             Faça seu check-in diário para acompanhar sua evolução.
//                                         </p>
//                                     </div>
//                                 </div>

//                                 <div className="bg-brand-2-500 border-brand-2-500 mt-2 w-full py-2 rounded-2xl flex items-center justify-center gap-2 border shadow-sm">
//                                     <span className="text-brand-2-100 font-bold text-sm">
//                                         Fazer Check-in
//                                     </span>
//                                 </div>
//                             </div>
//                         }

//                         {
//                             !isCheckIn && !nextTelemedicine.date && metric.ies <= 60 &&
//                             <div className="mb-4 w-full p-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-400 rounded-2xl flex flex-col gap-3">
//                                 <div className="flex items-center gap-2">
//                                     <FiAlertTriangle className="text-red-400" size={20} />
//                                     <span className="text-red-400 font-bold text-sm">
//                                     Precisando de apoio?
//                                     </span>
//                                 </div>

//                                 <a href="tel:188" className="w-full py-3 bg-red-600 hover:bg-red-700 active:scale-95 transition-all rounded-2xl flex items-center justify-center gap-3 text-white font-bold" >
//                                     <FiPhone size={20} />
//                                     <span>Ligar 188 - CVV (24h)</span>
//                                 </a>
//                             </div>
//                         }
                        
//                         {
//                             nextTelemedicine.date &&
//                             <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-4 flex flex-col gap-3">
//                                 <div className="flex items-center gap-2">
//                                     <FaVideo className="text-brand-500" size={20} />
//                                     <span className="text-brand-500 font-bold text-sm">
//                                         Próxima consulta - {maskDate(nextTelemedicine.date)}
//                                     </span>
//                                 </div>
                                
//                                 <span className="text-brand-500 font-bold text-sm">
//                                     Horario: {nextTelemedicine.to} até {nextTelemedicine.from}
//                                 </span>
//                                 <span className="text-brand-500 font-bold text-sm">
//                                     Especialidade: {nextTelemedicine.specialty}
//                                 </span>
//                                 <span className="text-brand-500 font-bold text-sm">
//                                     Profissional: {nextTelemedicine.professional}
//                                 </span>

//                                 <div className="bg-brand-500 border-brand-500 mt-2 w-full py-2 rounded-2xl flex items-center justify-center gap-2 border shadow-sm">
//                                     <span className="text-brand-100 font-bold text-sm">
//                                         Acessar consulta
//                                     </span>
//                                 </div>
//                             </div>
//                         }
//                         {
//                             metric.ipv > 0 &&
//                             <ul  className={`bg-white p-6 rounded-2xl border border-gray-200 mb-4 grid grid-cols-1 gap-4`}>
//                                 <li className={`${getColorDass9(dass9.depression)} rounded-2xl p-4 flex justify-between`}>
//                                     <span className="text-md font-semibold">Depressão</span>
//                                     <div className="flex items-center gap-2">
//                                         <span className="text-sm font-medium">{dass9.depression}</span>
//                                     </div>
//                                 </li>
//                                 <li className={`${getColorDass9(dass9.stress)} rounded-2xl p-4 flex justify-between`}>
//                                     <span className="text-md font-semibold">Ansiedade</span>
//                                     <div className="flex items-center gap-2">
//                                         <span className="text-sm font-medium">{dass9.stress}</span>
//                                     </div>
//                                 </li>
//                                 <li className={`${getColorDass9(dass9.anxiety)} rounded-2xl p-4 flex justify-between`}>
//                                     <span className="text-md font-semibold">Estresse</span>
//                                     <div className="flex items-center gap-2">
//                                         <span className="text-sm font-medium">{dass9.anxiety}</span>
//                                     </div>
//                                 </li>                    
//                             </ul>
//                         }
//                         <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-4">
//                             <div className="relative h-48 w-48 mx-auto mb-4">
//                                 <ResponsiveContainer width="100%" height="100%">
//                                     <PieChart>
//                                         <Pie
//                                             data={chartData}
//                                             innerRadius={60}
//                                             outerRadius={80}
//                                             startAngle={90}
//                                             endAngle={-270}
//                                             paddingAngle={0}
//                                             dataKey="value">
                                            
//                                             <Cell fill="#e2e8f0" stroke="none" />
//                                             <Cell fill={getBarColor(metric.ipv)} stroke="none" /> 
//                                         </Pie>
//                                     </PieChart>
//                                 </ResponsiveContainer>
//                                 <div className="absolute inset-0 flex flex-col items-center justify-center">
//                                     <span style={{color: getBarColor(metric.ipv)}} className="text-4xl font-bold">{metric.ipv}</span>
//                                     <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">IPV</span>
//                                 </div>
//                             </div>

//                             <div className="flex justify-center">
//                                 {
//                                     metric.ipv > 85 &&
//                                     <button className="bg-green-400 text-white px-8 py-1.5 rounded-full text-sm font-bold mb-6">
//                                         Excelente
//                                     </button>
//                                 }
//                                 {
//                                     metric.ipv > 60 && metric.ipv < 85 &&
//                                     <button className="bg-yellow-400 text-white px-8 py-1.5 rounded-full text-sm font-bold mb-6">
//                                         Atenção
//                                     </button>
//                                 }
//                                 {
//                                     metric.ipv < 60 &&
//                                     <button className="bg-red-400 text-white px-8 py-1.5 rounded-full text-sm font-bold mb-6">
//                                         Alerta
//                                     </button>
//                                 }
//                             </div>

//                             <div className="flex justify-center gap-8 mb-4">
//                                 <div className="text-center bg-gray-200 py-2 px-3 rounded-lg">
//                                     <p className={`text-[10px] font-bold ${getColorMetric(metric.igs)}`}>IGS</p>
//                                     <p className={`text-xl font-bold ${getColorMetric(metric.igs)}`}>{metric.igs}</p>
//                                 </div>
//                                 <div className="text-center bg-gray-200 py-2 px-3 rounded-lg">
//                                     <p className={`text-[10px] font-bold ${getColorMetric(metric.ign)}`}>IGN</p>
//                                     <p className={`text-xl font-bold ${getColorMetric(metric.ign)}`}>{metric.ign}</p>
//                                     </div>
//                                 <div className="text-center bg-gray-200 py-2 px-3 rounded-lg">
//                                     <p className={`text-[10px] font-bold ${getColorMetric(metric.ies)}`}>IES</p>
//                                     <p className={`text-xl font-bold ${getColorMetric(metric.ies)}`}>{metric.ies}</p>
//                                 </div>
//                             </div>
                            
//                             <p className="text-[10px] text-gray-400 font-medium leading-tight text-center">
//                                 Índice de Performance Vital<br/>Média de IGS + IGN + IES
//                             </p>
//                         </div>

//                         <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-4">
//                             <div className="flex justify-between items-center mb-6">
//                                 <h3 className="font-bold text-(--color-brand-400)">Evolução</h3>
//                                 <div className="flex gap-2 text-[10px] font-medium text-gray-500">
//                                     <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400" /> &gt;85</span>
//                                     <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400" /> 60-85</span>
//                                     <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400" /> &lt;60</span>
//                                 </div>
//                             </div>
                            
//                             <div className="h-48 w-full">
//                                 <ResponsiveContainer width="100%" height="100%">
//                                     <BarChart data={metricWeek} margin={{ top: 10, bottom: 10 }}>
//                                         <XAxis 
//                                             dataKey="day" 
//                                             axisLine={false} 
//                                             tickLine={false} 
//                                             tick={{fill: '#94a3b8', fontSize: 12}}
//                                         />
//                                         <YAxis hide domain={[0, 100]} />
                                        
//                                         <Bar dataKey="ipv" radius={[10, 10, 10, 10]} barSize={periodo === 'Semana' ? 55 : 20}>
//                                             {metricWeek.map((entry, index) => (
//                                                 <Cell 
//                                                     key={`cell-${index}`} 
//                                                     fill={GetBarColor(entry.ipv)} 
//                                                 />
//                                             ))}

//                                             <LabelList
//                                                 dataKey="ipv"
//                                                 content={(props) => {
//                                                     const { x, y, width, height, index } = props;
//                                                     const data = metricWeek[index!];

//                                                     if (periodo !== 'Semana' || !height || Number(height) < 60) return null;

//                                                     const centerX = Number(x) + Number(width) / 2;
//                                                     const startY = Number(y) + 20;

//                                                     return (
//                                                         <g>
//                                                             <text x={centerX} y={startY} fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">
//                                                                 {data.ipv.toFixed(0)}%
//                                                             </text>
//                                                             <line x1={Number(x) + 10} y1={startY + 5} x2={Number(x) + Number(width) - 10} y2={startY + 5} stroke="rgba(255,255,255,0.3)" />
//                                                             <text x={centerX} y={startY + 20} fill="#fff" fontSize="9" fontWeight="medium" textAnchor="middle">S: {data.igs.toFixed(0)}</text>
//                                                             <text x={centerX} y={startY + 32} fill="#fff" fontSize="9" fontWeight="medium" textAnchor="middle">N: {data.ign.toFixed(0)}</text>
//                                                             <text x={centerX} y={startY + 44} fill="#fff" fontSize="9" fontWeight="medium" textAnchor="middle">M: {data.ies.toFixed(0)}</text>
//                                                         </g>
//                                                     );
//                                                 }}
//                                             />
//                                         </Bar>
//                                     </BarChart>
//                                 </ResponsiveContainer>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             }
//         </div>
//     );
// }

"use client";

import { useAtom } from "jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import VitalModal from "../vital-modal/VitalModal";
import { VitalCheckInAtom, VitalModalAtom } from "@/jotai/vital/vital.jotai";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie, LabelList } from 'recharts';
import { FiAlertTriangle, FiPhone } from "react-icons/fi";
import { HiOutlineLightBulb } from "react-icons/hi";
import { FaVideo } from "react-icons/fa";
import { maskDate } from "@/utils/mask.util";
import { montserrat } from "../dass21/Dass21";
import Label from "@/components/form/LabelForm";
import Input from "@/components/form/input/Input";
import Button from "@/ui/Button";
import Link from "next/link";

const chartData = [
    { value: 10 },
    { value: 100 - 10 }
];

export default function Home() {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [modal, setModal] = useAtom(VitalModalAtom);
    const [isCheckIn, setIsCheckIn] = useAtom(VitalCheckInAtom);
    const [nextTelemedicine, setNextTelemedicine] = useState<any>({ date: "" });
    const [metric, setMetric] = useState<any>({ igs: 0, ign: 0, ies: 0, ipv: 0 });
    const [metricWeek, setMetricWeek] = useState<any[]>([]);
    const [periodo, setPeriodo] = useState('Semana');
    const [dass9, setDass9] = useState<any>({});
    const [startDate, setStartDate] = useState<string>("sem");
    const [endDate, setEndDate] = useState<string>("sem");

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

    useEffect(() => {
        const initial = async () => {
            setIsLoading(true);
            await getAll(periodo);
            await getLogged();
            setIsLoading(false);
        };
        initial();
    }, [isCheckIn, periodo]);

    return (
        <div className={`${montserrat.className}`}>
            {modal ? <VitalModal /> : (
                <div className="max-h-[calc(100dvh-13rem)] overflow-y-auto px-1">
                    {!isCheckIn && !nextTelemedicine.date && metric.ies <= 60 && (
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

                    {isCheckIn && (
                        <div onClick={() => setModal(true)} className="w-full bg-white p-6 rounded-2xl border border-gray-200 mb-4 flex flex-col gap-2 cursor-pointer">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-brand-2-500 rounded-xl">
                                    <HiOutlineLightBulb className="text-brand-2-100" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-brand-2-500 font-bold text-lg leading-tight">Registre seu dia</h3>
                                    <p className="text-gray-500 text-sm">Faça seu check-in diário para acompanhar sua evolução.</p>
                                </div>
                            </div>
                            <div className="bg-brand-2-500 mt-2 w-full py-2 rounded-2xl flex items-center justify-center border shadow-sm text-brand-2-100 font-bold text-sm">
                                Fazer Check-in
                            </div>
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
                                <BarChart 
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
                                </BarChart>
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