"use client";

import Input from "@/components/form/input/Input"
import { VitalIsManualModeAtom, VitalStepAtom } from "@/jotai/vital/vital.jotai";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { FaRegMoon } from "react-icons/fa"

export const VitalSono = ({ register, watch, setValue }: any) => {
    const [sleepFragmentation, setSleepFragmentation] = useState<string>("");
    const [isManualMode, setIsManualMode] = useAtom(VitalIsManualModeAtom);
    const fragmentationValue = watch("sleepFragmentation");
    const [step] = useAtom(VitalStepAtom);
    
    useEffect(() => {
        console.log("teste")
        // console.log(watch("sleepFragmentation"))
        // if(watch("sleepFragmentation") == "Outras") {
        //     console.log(sleepFragmentation)
        // };
    }, [step]);

    return (
        <div className="animate-in slide-in-from-right">
            <div className="flex items-center gap-3 text-lg font-bold mb-4 text-brand-500">
                <div className="bg-brand-500 text-white p-2 rounded-lg">
                    <FaRegMoon />
                </div>
                <h2 className="">Sono</h2>
            </div>

            <div className="max-h-[calc(100dvh-22.5rem)] overflow-y-auto">
                <div className="mb-4">
                    <label className="block text-sm text-brand-500 mb-2">Que horas você dormiu?</label>
                    <input type="time" {...register("sleepTime")} className="h-11 w-full border bg-white border-gray-200 text-brand-500 focus:border-(--color-brand-200) focus:outline-hidden rounded-lg px-3 py-2" />
                    {/* <input type="time" {...register("sleepTime")} className="w-full p-2 rounded-xl border bg-slate-800 text-brand-500 mb-6" /> */}
                </div>

                <div className="mb-4">
                    <label className="block text-sm text-brand-500 mb-2">Quantas horas dormiu?</label>
                    <select {...register("sleepHours")} className="h-11 w-full bg-white border border-gray-200 focus:border-(--color-brand-200) focus:outline-hidden rounded-lg px-3 py-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                            <option key={h} value={h}>{h} horas</option>
                            // <button
                            //     key={h} type="button"
                            //     onClick={() => setValue("sleepHours", h)}
                            //     className={`py-1 px-0 w-10 rounded-xl border transition-all ${watch("sleepHours") === h ? 'bg-brand-2-600 text-white' : 'bg-white border-gray-200 text-brand-500'}`}>
                            // {h}
                            // </button>
                        ))}
                    </select>

                    {/* <div className="grid grid-cols-6 gap-2">
                    {[5, 6, 7, 8, 9, 10].map((h) => (
                        <button
                            key={h} type="button"
                            onClick={() => setValue("sleepHours", h)}
                            className={`py-1 px-0 w-10 rounded-xl border transition-all ${watch("sleepHours") === h ? 'bg-brand-2-600 text-white' : 'bg-white border-gray-200 text-brand-500'}`}>
                        {h}
                        </button>
                    ))}
                    </div> */}
                </div>
                
                <div className="mb-4">
                    <label className="block text-sm text-brand-500 mb-2">Qualidade do sono</label>
                    <div className="grid grid-cols-6 gap-2">
                    {[1, 2, 3, 4, 5].map((h) => (
                        <div key={h}>
                            <button
                            key={h} type="button"
                            onClick={() => setValue("sleepQuality", h)}
                            className={`py-1 px-0 w-10 rounded-xl border transition-all ${watch("sleepQuality") === h ? 'bg-brand-2-600 text-white' : 'bg-white border-gray-200 text-brand-500'}`}
                            >
                            {h}
                            </button>
                            {
                                h == 1 &&
                                <span className="text-[11px] text-gray-500">Péssimo</span>
                            }
                            {
                                h == 5 &&
                                <span className="text-[11px] text-gray-500">Excelente</span>
                            }
                        </div>
                    ))}
                    </div>
                </div>    

                {/* <div className="mb-4">
                    <label className="block text-sm text-brand-500 mb-2">Fragmentação</label>
                    <div className="grid grid-cols-6 gap-2">
                    {['Não', '1', '2', '3', '4'].map((h) => (
                        <button
                        key={h} type="button"
                        onClick={() => setValue("sleepFragmentation", h)}
                        className={`py-1 px-0 w-10 rounded-xl border transition-all ${watch("sleepFragmentation") === h ? 'bg-brand-2-600 text-white' : 'bg-white border-gray-200 text-brand-500'}`}
                        >
                        {h == 'Não' ? h : `${h}x`}
                        </button>
                    ))}
                    </div>
                    <select {...register("sleepFragmentation")} className="h-11 w-full bg-white border border-gray-200 focus:border-(--color-brand-200) focus:outline-hidden rounded-lg px-3 py-2">
                        {['Não', '1', '2', '3', '4', 'Outras'].map((h) => (
                            <option key={h} value={h}>{h == 'Não' || h == 'Outras' ? h : `${h}x`}</option>
                        ))}
                    </select>
                    {
                        watch("sleepFragmentation") == "Outras" &&
                        <Input placeholder="Digite a fragmentação" className="mt-2" type="number" onChange={(e: any) => {
                            console.log(e.target.value.toString())
                            setSleepFragmentation(e.target.value.toString());
                        }} />
                    }
                </div>         */}
                
                <div className="mb-4">
                    <label className="block text-sm text-brand-500 mb-2">Quantas vezes acordou durante a noite?</label>
                    
                    <select 
                        className="h-11 w-full bg-white border border-gray-200 focus:border-(--color-brand-200) focus:outline-hidden rounded-lg px-3 py-2"
                        // O valor do select fica travado em "Outras" se o modo manual estiver ativo
                        value={isManualMode ? "Outras" : (['Não', '1', '2', '3', '4'].includes(fragmentationValue) ? fragmentationValue : "Outras")}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === "Outras") {
                                setIsManualMode(true);
                                setValue("sleepFragmentation", ""); // Limpa para o usuário digitar o 42
                            } else {
                                setIsManualMode(false);
                                setValue("sleepFragmentation", val);
                            }
                        }}
                    >
                        {['Não', '1', '2', '3', '4', 'Outras'].map((h) => (
                            <option key={h} value={h}>{h === 'Não' || h === 'Outras' ? h : `${h}x`}</option>
                        ))}
                    </select>

                    {/* Agora mostramos o input baseado no modo manual */}
                    {isManualMode && (
                        <Input 
                            placeholder="Digite a quantidade" 
                            className="mt-2" 
                            type="number"
                            autoFocus
                            value={fragmentationValue || ""} 
                            onChange={(e: any) => {
                                setValue("sleepFragmentation", e.target.value);
                            }} 
                        />
                    )}
                </div>
                <div className="mb-4">
                    <label className="block text-sm text-brand-500 mb-2">Usou telas antes de dormir?</label>
                    <div className="grid grid-cols-6 gap-2">
                    {['Sim', 'Não'].map((h) => (
                        <button
                        key={h} type="button"
                        onClick={() => setValue("sleepCell", h)}
                        className={`py-1 px-0 w-10 rounded-xl border transition-all ${watch("sleepCell") === h ? 'bg-brand-2-600 text-white' : 'bg-white border-gray-200 text-brand-500'}`}
                        >
                        {h}
                        </button>
                    ))}
                    </div>
                </div>        
            </div>
        </div>
    )
}