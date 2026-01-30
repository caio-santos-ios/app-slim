import { FaRegMoon } from "react-icons/fa"

export const VitalSono = ({ register, watch, setValue }: any) => {

    return (
        <div className="animate-in slide-in-from-right">
            <div className="flex items-center gap-3 text-lg font-bold mb-4 dark:text-white">
                <div className="bg-gray-500 p-2 rounded-lg">
                    <FaRegMoon />
                </div>
                <h2 className="">Sono</h2>
            </div>

            <div className="max-h-[calc(100dvh-20rem)] overflow-y-auto">
                <div>
                    <label className="block text-sm text-white mb-2">Que horas você dormiu?</label>
                    <input type="time" {...register("sleepTime")} className="w-full p-2 rounded-xl border bg-slate-800 text-white mb-6" />
                </div>

                <div className="mb-4">
                    <label className="block text-sm text-white mb-2">Quantas horas dormiu?</label>
                    <div className="grid grid-cols-6 gap-2">
                    {[5, 6, 7, 8, 9, 10].map((h) => (
                        <button
                        key={h} type="button"
                        onClick={() => setValue("sleepHours", h)}
                        className={`py-1 px-0 w-10 rounded-xl border transition-all ${watch("sleepHours") === h ? 'bg-blue-600 text-white' : 'dark:bg-slate-800 dark:text-white'}`}
                        >
                        {h}h
                        </button>
                    ))}
                    </div>
                </div>
                
                <div className="mb-4">
                    <label className="block text-sm text-white mb-2">Qualidade do sono</label>
                    <div className="grid grid-cols-6 gap-2">
                    {[1, 2, 3, 4, 5].map((h) => (
                        <div key={h}>
                            <button
                            key={h} type="button"
                            onClick={() => setValue("sleepQuality", h)}
                            className={`py-1 px-0 w-10 rounded-xl border transition-all ${watch("sleepQuality") === h ? 'bg-blue-600 text-white' : 'dark:bg-slate-800 dark:text-white'}`}
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

                <div className="mb-4">
                    <label className="block text-sm text-white mb-2">Fragmentação</label>
                    <div className="grid grid-cols-6 gap-2">
                    {['Não', 1, 2, 3, 4].map((h) => (
                        <button
                        key={h} type="button"
                        onClick={() => setValue("sleepFragmentation", h)}
                        className={`py-1 px-0 w-10 rounded-xl border transition-all ${watch("sleepFragmentation") === h ? 'bg-blue-600 text-white' : 'dark:bg-slate-800 dark:text-white'}`}
                        >
                        {h == 'Não' ? h : `${h}x`}
                        </button>
                    ))}
                    </div>
                </div>        
                
                <div className="mb-4">
                    <label className="block text-sm text-white mb-2">Usou telas antes de dormir?</label>
                    <div className="grid grid-cols-6 gap-2">
                    {['Sim', 'Não'].map((h) => (
                        <button
                        key={h} type="button"
                        onClick={() => setValue("sleepCell", h)}
                        className={`py-1 px-0 w-10 rounded-xl border transition-all ${watch("sleepCell") === h ? 'bg-blue-600 text-white' : 'dark:bg-slate-800 dark:text-white'}`}
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