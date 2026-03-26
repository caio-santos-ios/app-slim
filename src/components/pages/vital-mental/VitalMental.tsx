// VitalMental.tsx
import { LuBrain } from "react-icons/lu";
import { useState, useEffect } from "react";

// Pauta 9: ciclo de perguntas — cada grupo de 9 é uma "rodada"
// O índice do ciclo é persistido no localStorage para alternar entre rodadas
const QUESTION_CYCLES: Array<{ id: string; label: string; cat: string }[]> = [
    // Ciclo A — perguntas sutis (doc cliente)
    [
        { id: "dass1", label: "Você sentiu falta de perspectiva ou desânimo hoje?",          cat: "Depressão" },
        { id: "dass2", label: "Teve dificuldade em notar coisas boas no seu dia?",           cat: "Depressão" },
        { id: "dass3", label: "Sentiu-se desvalorizado(a) ou sem confiança?",                cat: "Depressão" },
        { id: "dass4", label: "Notou desconforto físico, como a boca seca?",                 cat: "Ansiedade" },
        { id: "dass5", label: "Sentiu sua respiração curta ou ofegante?",                    cat: "Ansiedade" },
        { id: "dass6", label: "Percebeu tremores ou agitação nas mãos/corpo?",               cat: "Ansiedade" },
        { id: "dass7", label: "Teve dificuldade para relaxar ou \"desligar\"?",              cat: "Estresse"  },
        { id: "dass8", label: "Sentiu-se impaciente ou irritável com os outros?",            cat: "Estresse"  },
        { id: "dass9", label: "Sentiu-se muito tenso(a) ou nervoso(a) hoje?",               cat: "Estresse"  },
    ],
    // Ciclo B — versão alternativa
    [
        { id: "dass1", label: "Sentiu que as coisas não tinham muito sentido hoje?",         cat: "Depressão" },
        { id: "dass2", label: "Foi difícil se animar com algo ao longo do dia?",             cat: "Depressão" },
        { id: "dass3", label: "Teve pensamentos de que não é bom(boa) o suficiente?",        cat: "Depressão" },
        { id: "dass4", label: "Percebeu a boca seca ou sensação de garganta seca?",          cat: "Ansiedade" },
        { id: "dass5", label: "Sentiu dificuldade para respirar fundo ou falta de ar?",      cat: "Ansiedade" },
        { id: "dass6", label: "Notou tremores, formigamento ou agitação no corpo?",          cat: "Ansiedade" },
        { id: "dass7", label: "Sua mente ficou acelerada, sem conseguir descansar?",         cat: "Estresse"  },
        { id: "dass8", label: "Ficou com pouca paciência para pessoas ou situações?",        cat: "Estresse"  },
        { id: "dass9", label: "Sentiu tensão no corpo, como ombros duros ou mandíbula presa?", cat: "Estresse" },
    ],
];

const CYCLE_KEY = "vitalMentalCycleIndex";

function getNextCycleIndex(): number {
    try {
        const stored = localStorage.getItem(CYCLE_KEY);
        const current = stored !== null ? parseInt(stored, 10) : -1;
        const next = (current + 1) % QUESTION_CYCLES.length;
        localStorage.setItem(CYCLE_KEY, String(next));
        return next;
    } catch {
        return 0;
    }
}

const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

export const VitalMental = ({ watch, setValue, className = "max-h-[calc(100dvh-26.2rem)]" }: any) => {

    const options = [
        { value: 1, label: "Não",      desc: "Não se aplicou" },
        { value: 2, label: "Pouco",    desc: "Algum grau" },
        { value: 3, label: "Bastante", desc: "Grau considerável" },
        { value: 4, label: "Sempre",   desc: "Quase sempre" },
    ];

    const [questionIds, setQuestionIds] = useState<string[]>([]);
    const [cycleIndex, setCycleIndex]   = useState<number>(0);

    useEffect(() => {
        const idx = getNextCycleIndex();
        setCycleIndex(idx);
        // Pauta 9: alternância de perguntas — shuffle dentro do ciclo selecionado
        const ids = shuffle(QUESTION_CYCLES[idx]).map((q) => q.id);
        setQuestionIds(ids);
    }, []);

    const currentCycle = QUESTION_CYCLES[cycleIndex] ?? QUESTION_CYCLES[0];

    return (
        <div className="animate-in slide-in-from-right">
            <div className="flex items-center gap-3 text-lg font-bold mb-2 text-brand-500">
                <div className="bg-brand-500 text-white p-2 rounded-lg">
                    <LuBrain />
                </div>
                {/* Pauta 7: removido "DASS 9" / "Avaliação DASS" */}
                <h2>Saúde Mental</h2>
            </div>

            <p className="text-[12px] mb-3 text-center rounded-lg border bg-red-100 border-red-500 text-red-500 font-bold py-2">
                Responda considerando como se sentiu nas últimas 24h.
            </p>

            <div className={`${className} overflow-y-auto`}>
                {questionIds.map((id) => {
                    const q = currentCycle.find((q) => q.id === id);
                    if (!q) return null;
                    return (
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
                    );
                })}
            </div>
        </div>
    );
};
