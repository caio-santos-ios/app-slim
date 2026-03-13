export const LineChartCustom = ({ data, periodo }: { data: any[], periodo: string }) => {
    const chartH = 150;
    const paddingLeft = 32;
    const paddingBottom = 20;
    const paddingTop = 36;
    const paddingRight = 16;
    const totalW = 380;
    const totalH = chartH + paddingBottom + paddingTop;

    const getColor = (val: number) => {
        if (val === null || val === undefined || val == 0) return '#94a3b8';
        if (val <= 60) return '#E24B4A';
        if (val < 85)  return '#EF9F27';
        return '#1D9E75';
    };

    if (!data || data.length === 0) return null;

    const count = data.length;
    const slotW = (totalW - paddingLeft - paddingRight) / (count - 1 || 1);

    const getX = (i: number) => paddingLeft + slotW * i;
    const getY = (val: number) => paddingTop + chartH - ((val ?? 0) / 100) * chartH;

    // Smooth bezier path
    const buildPath = () => {
        if (count === 1) return `M ${getX(0)} ${getY(data[0].ipv)}`;
        let d = `M ${getX(0)} ${getY(data[0].ipv)}`;
        for (let i = 0; i < count - 1; i++) {
            const x1 = getX(i), y1 = getY(data[i].ipv);
            const x2 = getX(i + 1), y2 = getY(data[i + 1].ipv);
            const cpx = (x1 + x2) / 2;
            d += ` C ${cpx} ${y1}, ${cpx} ${y2}, ${x2} ${y2}`;
        }
        return d;
    };

    const buildArea = () => {
        const baseY = paddingTop + chartH;
        return `${buildPath()} L ${getX(count - 1)} ${baseY} L ${getX(0)} ${baseY} Z`;
    };

    const formatLabel = (entry: any) => {
        if (periodo === 'Ano') return entry.day?.substring(0, 3);
        if (periodo === 'Mes') return entry.day?.includes('/') ? entry.day.split('/')[0] : entry.day;
        return entry.day;
    };

    return (
        <svg viewBox={`0 0 ${totalW} ${totalH}`} style={{ width: '100%', height: '100%' }}>
            <defs>
                <linearGradient id="line-area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1D9E75" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#1D9E75" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="line-stroke-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1D9E75" stopOpacity={0.5} />
                    <stop offset="50%" stopColor="#0F6E56" />
                    <stop offset="100%" stopColor="#1D9E75" stopOpacity={0.5} />
                </linearGradient>
                <filter id="dot-glow">
                    <feGaussianBlur stdDeviation="2" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
            </defs>

            <style>{`
                @keyframes drawLine { from { stroke-dashoffset: 2000; } to { stroke-dashoffset: 0; } }
                @keyframes fadeArea { from { opacity: 0; } to { opacity: 1; } }
                @keyframes popDot   { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes fadeTag  { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
                .lc-line { stroke-dasharray: 2000; animation: drawLine 1.4s cubic-bezier(0.4,0,0.2,1) both; }
                .lc-area { animation: fadeArea 1.2s ease 0.3s both; }
                .lc-dot  { animation: popDot 0.4s cubic-bezier(0.34,1.5,0.64,1) both; }
                .lc-tag  { animation: fadeTag 0.4s ease both; }
            `}</style>

            {/* Grid */}
            {[0, 0.33, 0.66, 1].map((t, i) => (
                <line key={i}
                    x1={paddingLeft} y1={paddingTop + chartH * t}
                    x2={totalW - paddingRight} y2={paddingTop + chartH * t}
                    stroke="#e2e8f0" strokeWidth={0.5}
                    strokeDasharray={t === 1 ? undefined : "4 4"}
                />
            ))}

            {/* Y labels */}
            {[100, 67, 33, 0].map((v, i) => (
                <text key={i}
                    x={paddingLeft - 5}
                    y={paddingTop + (chartH / 3) * i + 3}
                    fontSize={8} fill="#94a3b8" textAnchor="end"
                >{v}</text>
            ))}

            {/* Área preenchida */}
            <path className="lc-area" d={buildArea()} fill="url(#line-area-grad)" />

            {/* Linha principal */}
            <path
                className="lc-line"
                d={buildPath()}
                fill="none"
                stroke="url(#line-stroke-grad)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Pontos + tags */}
            {data.map((entry, i) => {
                
                const cx = getX(i);
                const cy = getY(entry.ipv ?? 0);
                const color = getColor(entry.ipv ?? 0);
                const delay = 0.8 + i * 0.07;
                const tagW = 32;
                const tagH = 20;
                const tagX = cx - tagW / 2;
                const tagY = cy - tagH - 10;

                return (
                    <g key={i}>
                        {/* Tag pill com valor */}
                        <g className="lc-tag" style={{ animationDelay: `${delay + 0.1}s` }}>
                            <rect
                                x={tagX} y={tagY}
                                width={tagW} height={tagH}
                                rx={10}
                                fill={color}
                            />
                            {/* Triângulo apontando pro ponto */}
                            <polygon
                                points={`${cx - 4},${tagY + tagH} ${cx + 4},${tagY + tagH} ${cx},${tagY + tagH + 5}`}
                                fill={color}
                            />
                            <text
                                x={cx} y={tagY + 13}
                                fontSize={10}
                                fontWeight="bold"
                                fill="white"
                                textAnchor="middle"
                            >
                                {Math.round(entry.ipv ?? 0)}
                            </text>
                        </g>

                        {/* Halo */}
                        <circle
                            className="lc-dot"
                            cx={cx} cy={cy} r={10}
                            fill={color} opacity={0.15}
                            style={{ transformOrigin: `${cx}px ${cy}px`, animationDelay: `${delay}s` }}
                        />
                        {/* Borda */}
                        <circle
                            className="lc-dot"
                            cx={cx} cy={cy} r={6}
                            fill="#ffffff" stroke={color} strokeWidth={2.5}
                            style={{ transformOrigin: `${cx}px ${cy}px`, animationDelay: `${delay}s` }}
                        />
                        {/* Centro */}
                        <circle
                            className="lc-dot"
                            cx={cx} cy={cy} r={3}
                            fill={color}
                            style={{ transformOrigin: `${cx}px ${cy}px`, animationDelay: `${delay}s` }}
                        />

                        {/* Label dia */}
                        <text
                            x={cx} y={paddingTop + chartH + 14}
                            fontSize={9} fill="#94a3b8" textAnchor="middle"
                        >
                            {formatLabel(entry)}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};