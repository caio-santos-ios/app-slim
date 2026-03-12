// VitalMental.tsx
import { LuBrain } from "react-icons/lu";
import { useState, useEffect } from "react";

const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

export const VitalMental = ({ watch, setValue, className = "max-h-[calc(100dvh-26.2rem)]" }: any) => {

    const allQuestions = [
        { id: "dass1", label: "1. Senti que não tinha perspectiva de nada.", cat: "Depressão" },
        { id: "dass2", label: "2. Senti que não conseguia sentir nada positivo.", cat: "Depressão" },
        { id: "dass3", label: "3. Senti que não tinha valor como pessoa.", cat: "Depressão" },
        { id: "dass4", label: "4. Senti a boca seca.", cat: "Ansiedade" },
        { id: "dass5", label: "5. Senti dificuldade em respirar.", cat: "Ansiedade" },
        { id: "dass6", label: "6. Senti tremores (ex: nas mãos).", cat: "Ansiedade" },
        { id: "dass7", label: "7. Senti dificuldade em relaxar.", cat: "Estresse" },
        { id: "dass8", label: "8. Senti-me muito irritável/intolerante.", cat: "Estresse" },
        { id: "dass9", label: "9. Senti que estava muito nervoso(a).", cat: "Estresse" },
    ];

    const options = [
        { value: 0, label: "Não", desc: "Não se aplicou" },
        { value: 1, label: "Pouco", desc: "Algum grau" },
        { value: 2, label: "Bastante", desc: "Grau considerável" },
        { value: 3, label: "Sempre", desc: "Quase sempre" },
    ];

    const [questions, setQuestions] = useState<any[]>([]);

    useEffect(() => {
        setQuestions(shuffle(allQuestions));
    }, []);

    return (
        <div className="animate-in slide-in-from-right">
            <div className="flex items-center gap-3 text-lg font-bold mb-2 text-brand-500">
                <div className="bg-brand-500 text-white p-2 rounded-lg">
                    <LuBrain />
                </div>
                <h2 className="">Saúde Mental</h2>
            </div>

            <p className="text-[12px] mb-3 text-center rounded-lg border bg-red-100 border-red-500 text-red-500 font-bold py-2">
                Responda considerando como se sentiu nas últimas 24h.
            </p>

            <div className={`${className} overflow-y-auto`}>
                {questions.map((q) => (
                    <div key={q.id} className="pb-4">
                        <label className="block text-sm text-brand-500 mb-2">
                            {q.label}
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {options.map((opt) => (
                                <div key={opt.value} className="flex flex-col items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setValue(q.id, opt.value)}
                                        className={`w-full py-2 rounded-xl border text-sm transition-all ${
                                            watch(q.id) === opt.value 
                                            ? 'bg-brand-2-600 text-white' 
                                            : 'bg-white border-gray-200 text-brand-500'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};