import { FaRegMoon } from "react-icons/fa"
import { IoIosNutrition } from "react-icons/io"

export const VitalNutricao = ({ register, setValue, watch }: any) => {

    return (
        <div className="animate-in slide-in-from-right">
            <div className="flex items-center gap-3 text-lg font-bold mb-4 dark:text-white">
                <div className="bg-gray-500 p-2 rounded-lg">
                    <IoIosNutrition />
                </div>
                <h2 className="">Nutrição</h2>
            </div>

            {/* <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl mb-6 text-center">
                <p className="text-sm text-blue-600 dark:text-blue-300">Sua meta calculada é de:</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-100">2.8 L / dia</p>
            </div> */}

            <div>
                <label className="block text-sm text-white mb-2">Hora da última refeição</label>
                <input type="time" {...register("lastMeal")} className="w-full p-2 rounded-xl border bg-slate-800 text-white mb-6" />
            </div>

            <div className="mb-4">
                <label className="block text-sm text-white mb-2">Carga Glicêmica</label>
                <div className="grid grid-cols-3 gap-4">
                {['Leve', 'Média', 'Pesada'].map((h) => (
                    <div key={h}>
                        <button
                        key={h} type="button"
                        onClick={() => setValue("glycemicLoad", h)}
                        className={`py-1 px-0 w-20 rounded-xl border transition-all ${watch("glycemicLoad") === h ? 'bg-blue-600 text-white' : 'dark:bg-slate-800 dark:text-white'}`}
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
                <label className="block text-sm text-white mb-2">Água consumida</label>
                <div className="relative">
                    <input type="number" step="100" {...register("waterAmount")} className="w-full p-4 rounded-xl border dark:bg-slate-800 dark:text-white pr-12" placeholder="Ex: 500" />
                    <span className="absolute right-4 top-4 text-gray-400">ml</span>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm text-white mb-2">Refeições em horários regulares?</label>
                <div className="grid grid-cols-6 gap-2">
                {['Sim', 'Não'].map((h) => (
                    <button
                    key={h} type="button"
                    onClick={() => setValue("snackHours", h)}
                    className={`py-1 px-0 w-10 rounded-xl border transition-all ${watch("snackHours") === h ? 'bg-blue-600 text-white' : 'dark:bg-slate-800 dark:text-white'}`}
                    >
                    {h}
                    </button>
                ))}
                </div>
            </div>       
        </div>
    )
}