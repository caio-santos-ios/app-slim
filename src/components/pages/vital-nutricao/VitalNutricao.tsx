import { FaRegMoon } from "react-icons/fa"
import { IoIosNutrition } from "react-icons/io"

export const VitalNutricao = ({ register, setValue, watch }: any) => {

    return (
        <div className="animate-in slide-in-from-right">
            <div className="flex items-center gap-3 text-lg font-bold mb-4 text-brand-500">
                <div className="bg-brand-500 text-white p-2 rounded-lg">
                    <IoIosNutrition />
                </div>
                <h2 className="">Nutrição</h2>
            </div>

            <div className="max-h-[calc(100dvh-22.5rem)] overflow-y-auto">
                <div className="mb-4">
                    <label className="block text-sm text-brand-500 mb-2">Hora da última refeição</label>
                    <input type="time" {...register("lastMeal")} className="h-11 w-full border bg-white border-gray-200 text-brand-500 focus:border-(--color-brand-200) focus:outline-hidden rounded-lg px-3 py-2" />
                    {/* <input type="time" {...register("lastMeal")} className="w-full p-2 rounded-xl border bg-slate-800 text-brand-500 mb-6" /> */}
                </div>

                <div className="mb-4">
                    <label className="block text-sm text-brand-500 mb-2">Carga Glicêmica</label>
                    <div className="grid grid-cols-3 gap-4">
                    {['Leve', 'Média', 'Pesada'].map((h) => (
                        <div key={h}>
                            <button
                            key={h} type="button"
                            onClick={() => setValue("glycemicLoad", h)}
                            className={`py-1 px-0 w-20 rounded-xl border transition-all ${watch("glycemicLoad") === h ? 'bg-brand-2-600 text-white' : 'bg-white border-gray-200 text-brand-500'}`}
                            >
                            {h}
                            </button>
                            {
                                h == 'Leve' &&
                                <span className="text-[11px] text-gray-500">Saladas, frutas</span>
                            }
                            {
                                h == 'Média' &&
                                <span className="text-[11px] text-gray-500">Equilibrada</span>
                            }
                            {
                                h == 'Pesada' &&
                                <span className="text-[11px] text-gray-500">Carbos, fritos</span>
                            }
                        </div>
                    ))}
                    </div>
                </div>   
                
                <div className="mb-4">
                    <label className="block text-sm text-brand-500 mb-2">Água consumida</label>
                    <div className="relative">
                        <input type="number" step="100" {...register("waterAmount")} className="w-full p-2 rounded-xl border bg-white border-gray-200 text-brand-500 focus:outline-0 pr-12" placeholder="Ex: 500" />
                        <span className="absolute right-4 top-2 text-gray-400">ml</span>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm text-brand-500 mb-2">Refeições em horários regulares?</label>
                    <div className="grid grid-cols-6 gap-2">
                    {['Sim', 'Não'].map((h) => (
                        <button
                        key={h} type="button"
                        onClick={() => setValue("snackHours", h)}
                        className={`py-1 px-0 w-10 rounded-xl border transition-all ${watch("snackHours") === h ? 'bg-brand-2-600 text-white' : 'bg-white border-gray-200 text-brand-500'}`}
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