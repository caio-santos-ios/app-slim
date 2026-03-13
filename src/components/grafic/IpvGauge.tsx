export const IpvGauge = ({ ipv }: { ipv: number }) => {
    const cx = 150, cy = 155, Re = 120, Ri = 88;
    const safe = Math.min(100, Math.max(0, ipv));
    const needleAngle = (safe / 100) * 180 - 90;

    const pt = (r: number, deg: number) => ({
        x: +(cx + r * Math.cos((deg * Math.PI) / 180)).toFixed(2),
        y: +(cy - r * Math.sin((deg * Math.PI) / 180)).toFixed(2)
    });

    const zones = [
        { from: 180, to: 72,  fill: '#E24B4A', label: 'Baixo', lx: 78,  ly: 128 },
        { from: 72,  to: 27,  fill: '#EF9F27', label: 'Médio', lx: 155, ly: 72  },
        { from: 27,  to: 0,   fill: '#1D9E75', label: 'Ótimo', lx: 240, ly: 122 },
    ];

    const arcPath = (from: number, to: number) => {
        const e1 = pt(Re, from), i1 = pt(Ri, from);
        const e2 = pt(Re, to),   i2 = pt(Ri, to);
        const large = Math.abs(from - to) > 180 ? 1 : 0;
        return `M ${i1.x},${i1.y} A ${Ri},${Ri} 0 ${large},1 ${i2.x},${i2.y} L ${e2.x},${e2.y} A ${Re},${Re} 0 ${large},0 ${e1.x},${e1.y} Z`;
    };

    const pillC = safe <= 60
        ? { bg: '#FCEBEB', text: '#E24B4A', sub: '#A32D2D' }
        : safe < 85
        ? { bg: '#FAEEDA', text: '#BA7517', sub: '#854F0B' }
        : { bg: '#E1F5EE', text: '#1D9E75', sub: '#0F6E56' };

    // Labels posicionados fora do arco nos divisores
    const labelOffset = Re + 16;
    const l0   = { x: 18,                         y: 158 };
    const l60  = pt(labelOffset, 72);
    const l85  = pt(labelOffset, 27);
    const l100 = { x: 282,                        y: 158 };

    return (
        <svg viewBox="0 0 300 175" style={{ width: '100%', maxWidth: 320, height: 200 }}>
            <defs>
                <style>{`
                    @keyframes ndAnim { from{transform:rotate(-90deg)} to{transform:rotate(${needleAngle}deg)} }
                    @keyframes ppAnim { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
                    .nd { animation: ndAnim 1.4s cubic-bezier(0.34,1.05,0.64,1) 0.3s both; transform-origin:${cx}px ${cy}px; }
                    .pp { animation: ppAnim 0.5s cubic-bezier(0.34,1.5,0.64,1) 1.2s both; transform-origin:${cx}px 162px; }
                `}</style>
            </defs>

            {/* Zonas */}
            {zones.map(z => (
                <g key={z.label}>
                    <path d={arcPath(z.from, z.to)} fill={z.fill}/>
                    <text x={z.lx} y={z.ly} fontSize="8" fill="white" fontWeight="700"
                        textAnchor="middle" fontFamily="system-ui,sans-serif"></text>
                </g>
            ))}

            {/* Divisores */}
            {[72, 27].map(deg => {
                const p = pt(Re, deg);
                return <line key={deg} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="white" strokeWidth="3"/>;
            })}

            {/* Ticks */}
            {Array.from({ length: 11 }, (_, i) => {
                const deg = 180 - i * 18;
                const outer = pt(Re, deg);
                const inner = pt(Re - 10, deg);
                return (
                    <line key={i}
                        x1={outer.x} y1={outer.y}
                        x2={inner.x} y2={inner.y}
                        stroke="white" strokeWidth={i % 4 === 0 ? 2 : 1.5} opacity="0.9"
                    />
                );
            })}

            {/* Labels: 0, 60, 85, 100 */}
            <text x={l0.x}   y={l0.y}   fontSize="9" fill="#94a3b8" textAnchor="middle" fontFamily="system-ui,sans-serif">0</text>
            <text x={l60.x}  y={l60.y}  fontSize="9" fill="#94a3b8" textAnchor="middle" fontFamily="system-ui,sans-serif">60</text>
            <text x={l85.x}  y={l85.y}  fontSize="9" fill="#94a3b8" textAnchor="middle" fontFamily="system-ui,sans-serif">85</text>
            <text x={l100.x} y={l100.y} fontSize="9" fill="#94a3b8" textAnchor="middle" fontFamily="system-ui,sans-serif">100</text>

            {/* Fundo interno */}
            <circle cx={cx} cy={cy} r={Ri - 3} fill="white"/>

            {/* Agulha */}
            <g className="nd">
                <line x1={cx} y1={cy} x2={cx} y2={cy - Re + 10}
                    stroke="#1e293b" strokeWidth="3" strokeLinecap="round"/>
            </g>

            {/* Pivot */}
            <circle cx={cx} cy={cy} r="11" fill="#1e293b"/>
            <circle cx={cx} cy={cy} r="6"  fill="white"/>
            <circle cx={cx} cy={cy} r="2.5" fill={pillC.text}/>

            {/* Pill */}
            <g className="pp">
                <rect x="120" y="160" width="60" height="22" rx="11" fill={pillC.bg}/>
                <text x={cx} y="175" fontSize="12" fontWeight="700" fill={pillC.text}
                    textAnchor="middle" fontFamily="system-ui,sans-serif">
                    {Math.round(safe)} IPV
                </text>
            </g>
        </svg>
    );
};