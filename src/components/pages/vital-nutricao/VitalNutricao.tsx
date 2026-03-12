import { IoIosNutrition } from "react-icons/io"
import { useState, useEffect } from "react"

const questions = (register: any, setValue: any, watch: any) => [
    {
        id: "lastMeal",
        render: () => (
            <div className="mb-4">
                <label className="block text-sm text-brand-500 mb-2">Hora da última refeição</label>
                <input type="time" {...register("lastMeal")} className="h-11 w-full border bg-white border-gray-200 text-brand-500 focus:border-(--color-brand-200) focus:outline-hidden rounded-lg px-3 py-2" />
            </div>
        )
    },
    {
        id: "glycemicLoad",
        render: () => (
            <div className="mb-4">
                <label className="block text-sm text-brand-500 mb-2">Carga Glicêmica</label>
                <div className="grid grid-cols-3 gap-4">
                    {['Leve', 'Média', 'Pesada'].map((h) => (
                        <div key={h}>
                            <button type="button" onClick={() => setValue("glycemicLoad", h)}
                                className={`py-1 px-0 w-20 rounded-xl border transition-all ${watch("glycemicLoad") === h ? 'bg-brand-2-600 text-white' : 'bg-white border-gray-200 text-brand-500'}`}>
                                {h}
                            </button>
                            {h == 'Leve' && <span className="text-[11px] text-gray-500">Saladas, frutas</span>}
                            {h == 'Média' && <span className="text-[11px] text-gray-500">Equilibrada</span>}
                            {h == 'Pesada' && <span className="text-[11px] text-gray-500">Carbos, fritos</span>}
                        </div>
                    ))}
                </div>
            </div>
        )
    },
    {
        id: "waterAmount",
        render: () => (
            <div className="mb-4">
                <label className="block text-sm text-brand-500 mb-2">Água consumida</label>
                <div className="relative">
                    <input type="number" step="100" {...register("waterAmount")} className="w-full p-2 rounded-xl border bg-white border-gray-200 text-brand-500 focus:outline-0 pr-12" placeholder="Ex: 500" />
                    <span className="absolute right-4 top-2 text-gray-400">ml</span>
                </div>
            </div>
        )
    },
    {
        id: "snackHours",
        render: () => (
            <div className="mb-4">
                <label className="block text-sm text-brand-500 mb-2">Refeições em horários regulares?</label>
                <div className="grid grid-cols-6 gap-2">
                    {['Sim', 'Não'].map((h) => (
                        <div key={h}>
                            <button type="button" onClick={() => setValue("snackHours", h)}
                                className={`py-1 px-0 w-10 rounded-xl border transition-all ${watch("snackHours") === h ? 'bg-brand-2-600 text-white' : 'bg-white border-gray-200 text-brand-500'}`}>
                                {h}
                            </button>
                        </div>
                    ))}
                    <span className="text-[11px] text-gray-500 col-span-6">Café, Almoço e Janta</span>
                </div>
            </div>
        )
    }
];

const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

export const VitalNutricao = ({ register, setValue, watch, className = "max-h-[calc(100dvh-22.5rem)]" }: any) => {
    const [orderedQuestions, setOrderedQuestions] = useState<any[]>([]);

    useEffect(() => {
        setOrderedQuestions(shuffle(questions(register, setValue, watch)));
    }, []);

    return (
        <div className="animate-in slide-in-from-right">
            <div className="flex items-center gap-3 text-lg font-bold mb-4 text-brand-500">
                <div className="bg-brand-500 text-white p-2 rounded-lg">
                    <IoIosNutrition />
                </div>
                <h2>Nutrição</h2>
            </div>

            <div className={`${className} overflow-y-auto`}>
                {orderedQuestions.map((q) => (
                    <div key={q.id}>{q.render()}</div>
                ))}
            </div>
        </div>
    );
}