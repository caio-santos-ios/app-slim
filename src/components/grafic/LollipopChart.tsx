export const LollipopChart = ({ data, periodo }: { data: any[], periodo: string }) => {
    const chartH = 170;
    const paddingLeft = 28;
    const paddingBottom = 20;
    const paddingTop = 24;

    const getColor = (val: number) => {
        if (val === null || val === undefined || val == 0) return { solid: '#94a3b8', dark: '#94a3b8' };
        if (val <= 60) return { solid: '#E24B4A', dark: '#A32D2D' };
        if (val < 85)  return { solid: '#EF9F27', dark: '#854F0B' };
        return { solid: '#1D9E75', dark: '#085041' };
    };

    const totalH = chartH + paddingBottom + paddingTop;

    return (
        <svg viewBox={`0 0 380 ${totalH}`} style={{ width: '100%', height: '100%' }}>
            <defs>
                {data.map((_, i) => {
                    const c = getColor(data[i]?.ipv ?? 0);
                    return (
                        <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={c.solid} />
                            <stop offset="100%" stopColor={c.dark} stopOpacity={0.4} />
                        </linearGradient>
                    );
                })}
            </defs>

            <style>{`
                @keyframes growUp { from { transform: scaleY(0); } to { transform: scaleY(1); } }
                @keyframes popIn  { from { transform: scale(0); opacity:0; } to { transform: scale(1); opacity:1; } }
                @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
                .lp-bar { animation: growUp 0.7s cubic-bezier(0.34,1.3,0.64,1) both; }
                .lp-dot { animation: popIn 0.4s cubic-bezier(0.34,1.5,0.64,1) both; }
                .lp-lbl { animation: fadeIn 0.4s ease both; }
            `}</style>

            {/* Grid lines */}
            <line x1={paddingLeft} y1={paddingTop} x2={380} y2={paddingTop} stroke="#e2e8f0" strokeWidth={0.4} strokeDasharray="4 4" />
            <line x1={paddingLeft} y1={paddingTop + chartH * 0.33} x2={380} y2={paddingTop + chartH * 0.33} stroke="#e2e8f0" strokeWidth={0.4} strokeDasharray="4 4" />
            <line x1={paddingLeft} y1={paddingTop + chartH * 0.66} x2={380} y2={paddingTop + chartH * 0.66} stroke="#e2e8f0" strokeWidth={0.4} strokeDasharray="4 4" />
            <line x1={paddingLeft} y1={paddingTop + chartH} x2={380} y2={paddingTop + chartH} stroke="#e2e8f0" strokeWidth={0.5} />

            {/* Y labels */}
            <text x={paddingLeft - 4} y={paddingTop + 3} fontSize={8} fill="#94a3b8" textAnchor="end">100</text>
            <text x={paddingLeft - 4} y={paddingTop + chartH * 0.33 + 3} fontSize={8} fill="#94a3b8" textAnchor="end">67</text>
            <text x={paddingLeft - 4} y={paddingTop + chartH * 0.66 + 3} fontSize={8} fill="#94a3b8" textAnchor="end">33</text>
            <text x={paddingLeft - 4} y={paddingTop + chartH + 3} fontSize={8} fill="#94a3b8" textAnchor="end">0</text>

            {data.map((entry, i) => {
                const count = data.length;
                const slotW = (380 - paddingLeft) / count;
                const cx = paddingLeft + slotW * i + slotW / 2;
                const barW = Math.min(slotW * 0.45, 22);
                const barH = ((entry.ipv ?? 0) / 100) * chartH;
                const barY = paddingTop + (chartH - barH);
                const dotY = barY - 14;
                const c = getColor(entry.ipv ?? 0);
                const delay = i * 0.08;

                return (
                    <g key={i}>
                        {/* Barra arredondada com gradiente */}
                        <rect
                            className="lp-bar"
                            x={cx - barW / 2}
                            y={barY}
                            width={barW}
                            height={barH}
                            rx={barW / 2}
                            fill={`url(#grad-${i})`}
                            style={{
                                transformOrigin: `${cx}px ${paddingTop + chartH}px`,
                                animationDelay: `${delay}s`
                            }}
                        />
                        {/* Linha lollipop */}
                        <line
                            className="lp-lbl"
                            x1={cx} y1={barY}
                            x2={cx} y2={dotY + 7}
                            stroke={c.solid}
                            strokeWidth={1.5}
                            style={{ animationDelay: `${0.6 + delay}s` }}
                        />
                        {/* Círculo lollipop */}
                        <circle
                            className="lp-dot"
                            cx={cx} cy={dotY}
                            r={8}
                            fill={c.solid}
                            style={{
                                transformOrigin: `${cx}px ${dotY}px`,
                                animationDelay: `${0.65 + delay}s`
                            }}
                        />
                        {/* Valor dentro do círculo */}
                        <text
                            className="lp-lbl"
                            x={cx} y={dotY + 3}
                            fontSize={10}
                            fill="white"
                            textAnchor="middle"
                            fontWeight="bold"
                            style={{ animationDelay: `${0.7 + delay}s` }}
                        >
                            {Math.round(entry.ipv ?? 0)}
                        </text>
                        {/* Label dia */}
                        <text x={cx} y={paddingTop + chartH + 14} fontSize={9} fill="#94a3b8" textAnchor="middle">
                            {periodo === 'Ano' ? entry.day?.substring(0, 3) :
                                periodo === 'Mes' ? (entry.day?.includes('/') ? entry.day.split('/')[0] : entry.day) :
                                entry.day}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};