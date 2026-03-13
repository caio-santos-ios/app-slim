export const IpvRing = ({ ipv, igs, ign, ies }: { ipv: number, igs: number, ign: number, ies: number }) => {
    const r = 76;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - (ipv / 100));

    const ringColor = (v: number) => {
        if (v <= 60) return { stroke: '#E24B4A', text: '#E24B4A', bg: '#FCEBEB', label: '#A32D2D' };
        if (v < 85)  return { stroke: '#EF9F27', text: '#BA7517', bg: '#FAEEDA', label: '#854F0B' };
        return      { stroke: '#1D9E75', text: '#1D9E75', bg: '#E1F5EE', label: '#0F6E56' };
    };

    const ipvC = ringColor(ipv);

    return (
        <div className="">
            <div className="flex justify-center mb-2">
                <svg viewBox="0 0 200 200" width="180" height="180">
                    <defs>
                        <style>{`
                            @keyframes ringFill { from { stroke-dashoffset: ${circ}; } to { stroke-dashoffset: ${offset}; } }
                            @keyframes popNum  { from { opacity:0; transform:scale(0.6); } to { opacity:1; transform:scale(1); } }
                            .ipv-ring { animation: ringFill 1.2s cubic-bezier(0.4,0,0.2,1) both; }
                            .ipv-num  { animation: popNum 0.5s cubic-bezier(0.34,1.4,0.64,1) 0.9s both; }
                        `}</style>
                    </defs>
                    {/* Decorativo externo */}
                    <circle cx="100" cy="100" r="92" fill="none" stroke={ipvC.stroke} strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="4 6" />
                    {/* Track */}
                    <circle cx="100" cy="100" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" transform="rotate(-90 100 100)" />
                    {/* Fill animado */}
                    <circle
                        className="ipv-ring"
                        cx="100" cy="100" r={r}
                        fill="none"
                        stroke={ipvC.stroke}
                        strokeWidth="14"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        transform="rotate(-90 100 100)"
                    />
                    {/* Ponto topo */}
                    <circle cx="100" cy="24" r="5" fill={ipvC.stroke} opacity="0.4" />
                    {/* Valor */}
                    <g className="ipv-num" style={{ transformOrigin: '100px 100px' }}>
                        <text x="100" y="93" fontSize="42" fontWeight="700" fill={ipvC.text} textAnchor="middle">{Math.round(ipv)}</text>
                        <text x="100" y="114" fontSize="11" fontWeight="500" fill="#94a3b8" textAnchor="middle" letterSpacing="3">IPV</text>
                    </g>
                </svg>
            </div>

            {/* Divisor */}
            <div className="border-t border-gray-100 mb-4" />

            {/* Métricas */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'IGS', value: igs },
                    { label: 'IGN', value: ign },
                    { label: 'IES', value: ies },
                ].map(({ label, value }) => {
                    const c = ringColor(value);
                    return (
                        <div key={label} className="flex flex-col items-center py-3 rounded-2xl" style={{ background: c.bg }}>
                            <span className="text-[10px] font-bold tracking-widest mb-1" style={{ color: c.label }}>{label}</span>
                            <span className="text-xl font-bold" style={{ color: c.text }}>{Math.round(value)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};