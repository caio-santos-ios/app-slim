import { LuBrain } from "react-icons/lu"

export const VitalMental = ({ watch, setValue }: any) => {

    return (
        <div className="animate-in slide-in-from-right">
            <div className="flex items-center gap-3 text-lg font-bold mb-4 dark:text-white">
                <div className="bg-gray-500 p-2 rounded-lg">
                    <LuBrain />
                </div>
                <h2 className="">Mental</h2>
            </div>
            
            <div className="mb-4">
                <label className="block text-sm text-white mb-2">Humor</label>
                <div className="flex justify-between gap-2">
                {["pessimo", "ruim", "neutro", "bom", "excelente"].map((mood) => (
                    <button
                    key={mood} type="button"
                    onClick={() => setValue("mood", mood)}
                    className={`flex-1 p-2 rounded-2xl text-2xl border transition-all ${watch("mood") === mood ? 'bg-blue-600 border-blue-600' : 'dark:bg-slate-800'}`}>
                    {mood === "pessimo" ? "😫" : mood === "ruim" ? "😕" : mood === "neutro" ? "😐" : mood === "bom" ? "🙂" : "🤩"}
                    </button>
                ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm text-white mb-2">Nivel de estresse</label>
                <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((h) => (
                    <div key={h}>
                        <button
                        key={h} type="button"
                        onClick={() => setValue("stress", h)}
                        className={`py-1 px-0 w-15 rounded-xl border transition-all ${watch("stress") === h ? 'bg-blue-600 text-white' : 'dark:bg-slate-800 dark:text-white'}`}
                        >
                        {h}
                        </button>
                        {
                            h == 1 &&
                            <span className="text-[11px] text-gray-500">tranquilo</span>
                        }
                        {
                            h == 5 &&
                            <span className="text-[11px] text-gray-500">Muito estre.</span>
                        }
                    </div>
                ))}
                </div>
            </div>  

            <div className="mb-4">
                <label className="block text-sm text-white mb-2">Praticou descompressão?</label>
                <div className="grid grid-cols-6 gap-2">
                {['Sim', 'Não'].map((h) => (
                    <button
                    key={h} type="button"
                    onClick={() => setValue("decompression", h)}
                    className={`py-1 px-0 w-10 rounded-xl border transition-all ${watch("decompression") === h ? 'bg-blue-600 text-white' : 'dark:bg-slate-800 dark:text-white'}`}
                    >
                    {h}
                    </button>
                ))}
                </div>
                <span className="text-[11px] text-gray-500">Meditação, exercício, hobby</span>
            </div> 
        </div>
    )
}