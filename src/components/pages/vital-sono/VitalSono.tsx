import { FaRegMoon } from "react-icons/fa"

export const VitalSono = ({ register, watch, setValue }: any) => {

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
                    <div className="grid grid-cols-6 gap-2">
                    {[5, 6, 7, 8, 9, 10].map((h) => (
                        <button
                            key={h} type="button"
                            onClick={() => setValue("sleepHours", h)}
                            className={`py-1 px-0 w-10 rounded-xl border transition-all ${watch("sleepHours") === h ? 'bg-brand-2-600 text-white' : 'bg-white border-gray-200 text-brand-500'}`}>
                        {h}
                        </button>
                    ))}
                    </div>
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

                <div className="mb-4">
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