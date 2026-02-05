"use client";

import { useEffect, useState } from 'react';
import { Montserrat } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion'; 
import { api } from '@/service/api.service';
import { configApi, resolveResponse } from '@/service/config.service';
import { useAtom } from 'jotai';
import { loadingAtom } from '@/jotai/global/loading.jotai';
import { profileAtom } from '@/jotai/profile/profile.jotai';
import { useForm } from 'react-hook-form';
import { TProfile } from '@/types/profile/profile.type';
import { FaQuestion } from 'react-icons/fa';

export const montserrat = Montserrat({ subsets: ['latin'] });

const perguntasDass21 = [
    { id: 1, texto: "Achei difícil me acalmar", tipo: "estresse" },
    { id: 2, texto: "Senti minha boca seca", tipo: "ansiedade" },
    { id: 3, texto: "Não consegui vivenciar qualquer sentimento positivo", tipo: "depressao" },
    { id: 4, texto: "Tive dificuldade em respirar (ex: respiração ofegante, falta de ar sem esforço físico)", tipo: "ansiedade" },
    { id: 5, texto: "Achei difícil ter iniciativa para fazer as coisas", tipo: "depressao" },
    { id: 6, texto: "Tive a tendência de reagir de forma exagerada às situações", tipo: "estresse" },
    { id: 7, texto: "Senti tremores (ex: nas mãos)", tipo: "ansiedade" },
    { id: 8, texto: "Senti que estava sempre nervoso", tipo: "estresse" },
    { id: 9, texto: "Preocupei-me com situações em que eu pudesse entrar em pânico e parecer ridículo", tipo: "ansiedade" },
    { id: 10, texto: "Senti que não tinha nada a desejar no futuro", tipo: "depressao" },
    { id: 11, texto: "Senti-me agitado", tipo: "estresse" },
    { id: 12, texto: "Achei difícil relaxar", tipo: "estresse" },
    { id: 13, texto: "Senti-me triste e sem ânimo", tipo: "depressao" },
    { id: 14, texto: "Fui intolerante com qualquer coisa que me impedisse de continuar o que estava fazendo", tipo: "estresse" },
    { id: 15, texto: "Senti que estava prestes a entrar em pânico", tipo: "ansiedade" },
    { id: 16, texto: "Fui incapaz de me entusiasmar com qualquer coisa", tipo: "depressao" },
    { id: 17, texto: "Senti que não tinha muito valor como pessoa", tipo: "depressao" },
    { id: 18, texto: "Senti que estava um pouco sensível demais", tipo: "estresse" },
    { id: 19, texto: "Percebi a ação do meu coração mesmo sem esforço físico (ex: batimento acelerado)", tipo: "ansiedade" },
    { id: 20, texto: "Senti medo sem motivo algum", tipo: "ansiedade" },
    { id: 21, texto: "Senti que a vida não tinha sentido", tipo: "depressao" }
];

export const QuizDass21 = () => {
    const [open, setOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [__, setPhoto] = useAtom(profileAtom);
    const { reset, register, watch, handleSubmit, setValue} = useForm<TProfile>();

    const getLogged = async () => {
        try {
            setIsLoading(true);
            const {data} = await api.get(`/customer-recipients/logged`, configApi());
            const result = data.result.data;  
            reset(result);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = async (value: number) => {
        const updatedAnswers = [...answers, value];
        
        if (currentStep < perguntasDass21.length - 1) {
            setAnswers(updatedAnswers);
            setCurrentStep(currentStep + 1);
        } else {
            const finalScores = calcularResultados(updatedAnswers);
            const body = {
                depression: finalScores.depressao, 
                stress: finalScores.estresse, 
                anxiety: finalScores.ansiedade, 
                id: watch("id")
            }
            const {data} = await api.put(`/customer-recipients/dass`, body, configApi());
            const result = data.result; 
            resolveResponse({status: 200, message: "Salvo com sucesso!"});
            console.log(result)
            setOpen(false);
            await getLogged();
            setCurrentStep(0);
        }
    };

    const calcularResultados = (allAnswers: number[]) => {
        const scores = { depressao: 0, ansiedade: 0, estresse: 0 };
        
        allAnswers.forEach((score, index) => {
            const pergunta = perguntasDass21[index];

            if (pergunta && pergunta.tipo) {
            const tipo = pergunta.tipo as 'depressao' | 'ansiedade' | 'estresse';
            scores[tipo] += score;
            }
        });

        return {
            depressao: scores.depressao * 2,
            ansiedade: scores.ansiedade * 2,
            estresse: scores.estresse * 2,
            total: (scores.depressao + scores.ansiedade + scores.estresse) * 2
        };
    };

    let progress = ((currentStep + 1) / perguntasDass21.length) * 100;

    useEffect(() => {
        const initial = async () => {
            await getLogged();
        }
        initial();
    }, []);
    
    return (
        <>
            {
                open &&
                <div className={`${montserrat.className} max-w-lg max-h-[calc(100dvh-13rem)] overflow-y-auto mx-auto bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl`}>
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold text-brand-2-500 uppercase tracking-tighter">Avaliação DASS-21</span>
                    <span className="text-[10px] font-bold text-gray-400">{currentStep + 1} / 21</span>
                </div>

                <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
                    <div 
                    className="h-full bg-brand-2-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                    key={currentStep}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="min-h-2.5 mb-10"
                    >
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
                        {perguntasDass21[currentStep].texto}
                    </h2>
                    </motion.div>
                </AnimatePresence>

                <div className="grid gap-3">
                    {[
                    { label: "Não se aplicou de maneira alguma", val: 0 },
                    { label: "Aplicou-se em algum grau", val: 1 },
                    { label: "Grau considerável", val: 2 },
                    { label: "Aplicou-se muito estritamente", val: 3 }
                    ].map((op) => (
                    <button
                        key={op.val}
                        onClick={() => handleSelect(op.val)}
                        className="w-full p-2 text-left border-2 border-slate-50 dark:border-slate-800 rounded-2xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                    >
                        <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 group-hover:text-blue-600">
                            {op.label}
                        </span>
                        <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-blue-500" />
                        </div>
                    </button>
                    ))}
                </div>

                <button 
                    onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
                    className="mt-8 w-full text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600"
                >
                    Voltar pergunta anterior
                </button>
                </div>
            }

            {
                !open &&
                <>
                    <ul  className={`${montserrat.className} bg-white p-6 rounded-2xl border border-gray-200 mb-4 grid grid-cols-1 gap-4`}>
                        <li className="bg-gray-200 rounded-2xl p-4 flex justify-between">
                            <span className="text-md font-semibold text-brand-800">Depressão</span>
                            <div className="flex items-center gap-2 text-gray-500">
                                <span className="text-sm font-medium">{watch("dass.depression")}</span>
                            </div>
                        </li>
                        <li className="bg-gray-200 rounded-2xl p-4 flex justify-between">
                            <span className="text-md font-semibold text-brand-800">Ansiedade</span>
                            <div className="flex items-center gap-2 text-gray-500">
                                <span className="text-sm font-medium">{watch("dass.stress")}</span>
                            </div>
                        </li>
                        <li className="bg-gray-200 rounded-2xl p-4 flex justify-between">
                            <span className="text-md font-semibold text-brand-800">Estresse</span>
                            <div className="flex items-center gap-2 text-gray-500">
                                <span className="text-sm font-medium">{watch("dass.anxiety")}</span>
                            </div>
                        </li>                    
                    </ul>

                    <div onClick={() => setOpen(true)} className={`${montserrat.className} bg-white p-6 rounded-2xl border border-gray-200`}>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-brand-2-800 rounded-xl">
                                <FaQuestion className="text-brand-2-600 dark:text-brand-2-400" size={24} />
                            </div>
                            
                            <div className="flex flex-col">
                                <h3 className="text-brand-2-800 font-bold text-lg leading-tight">
                                    Avaliação DASS-21
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Um questionário científico para avaliar níveis de depressão, ansiedade e estresse.
                                </p>
                            </div>
                        </div>

                        <div className="bg-brand-2-700 border-brand-2-800 mt-2 w-full py-2 rounded-2xl flex items-center justify-center gap-2 border shadow-sm">
                            <span className="text-blue-950 dark:text-blue-100 font-bold text-sm">
                                Iniciar Avaliação
                            </span>
                        </div>
                    </div>
                </>
            }
        </>
    );
};