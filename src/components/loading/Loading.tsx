// "use client";

// import { loadingAtom } from "@/jotai/global/loading.jotai";
// import { useAtom } from "jotai";

// export const Loading = () => {
//     const [loading] = useAtom(loadingAtom);

//     if (!loading) return null;

//     return (
//         <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md">
//             <div className="flex flex-col items-center gap-8">

//                 {/* Orbs flutuantes */}
//                 <div className="relative w-24 h-24">

//                     {/* Orb central */}
//                     <div
//                         className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-brand-2-500"
//                         style={{
//                             // boxShadow: "0 0 30px 8px rgba(113,39,167,0.5), 0 0 60px 16px rgba(113,39,167,0.2)",
//                             boxShadow: "0 0 30px 8px rgba(0,51,102,0.5), 0 0 60px 16px rgba(0,51,102,0.2)",
//                             animation: "breathe 2s ease-in-out infinite",
//                         }}
//                     />

//                     {/* Orb orbitando 1 */}
//                     <div
//                         className="absolute top-0 left-0 w-full h-full"
//                         style={{ animation: "orbit1 1.6s linear infinite" }}
//                     >
//                         <div
//                             className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-brand-2-400"
//                             style={{ boxShadow: "0 0 12px 4px rgba(0,51,102,0.6)" }}
//                         />
//                     </div>

//                     {/* Orb orbitando 2 */}
//                     <div
//                         className="absolute top-0 left-0 w-full h-full"
//                         style={{ animation: "orbit2 2.4s linear infinite" }}
//                     >
//                         <div
//                             className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-brand-2-300"
//                             style={{ boxShadow: "0 0 10px 3px rgba(0,51,102,0.5)" }}
//                         />
//                     </div>

//                     {/* Orb orbitando 3 */}
//                     <div
//                         className="absolute top-0 left-0 w-full h-full"
//                         style={{ animation: "orbit3 2s linear infinite reverse" }}
//                     >
//                         <div
//                             className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-2-300"
//                             style={{ boxShadow: "0 0 8px 3px rgba(0,51,102,0.7)" }}
//                         />
//                     </div>

//                     {/* Anel de rastro */}
//                     <div
//                         className="absolute inset-2 rounded-full border border-brand-2-500/20"
//                         style={{ animation: "ripple 2s ease-out infinite" }}
//                     />
//                     <div
//                         className="absolute inset-2 rounded-full border border-brand-2-500/10"
//                         style={{ animation: "ripple 2s ease-out infinite 0.6s" }}
//                     />
//                 </div>

//                 {/* Texto com letras animadas */}
//                 <div className="flex items-center gap-1">
//                     {"CARREGANDO".split("").map((char, i) => (
//                         <span
//                             key={i}
//                             className="text-[10px] font-mono tracking-widest text-brand-2-400"
//                             style={{
//                                 animation: `blink 1.4s ease-in-out infinite`,
//                                 animationDelay: `${i * 80}ms`,
//                             }}
//                         >
//                             {char}
//                         </span>
//                     ))}
//                 </div>

//             </div>

//             <style>{`
//                 @keyframes breathe {
//                     0%, 100% { transform: scale(1);   opacity: 1; }
//                     50%       { transform: scale(1.3); opacity: 0.8; }
//                 }
//                 @keyframes orbit1 {
//                     from { transform: rotate(0deg); }
//                     to   { transform: rotate(360deg); }
//                 }
//                 @keyframes orbit2 {
//                     from { transform: rotate(120deg); }
//                     to   { transform: rotate(480deg); }
//                 }
//                 @keyframes orbit3 {
//                     from { transform: rotate(240deg); }
//                     to   { transform: rotate(600deg); }
//                 }
//                 @keyframes ripple {
//                     0%   { transform: scale(1);   opacity: 0.4; }
//                     100% { transform: scale(2.2); opacity: 0; }
//                 }
//                 @keyframes blink {
//                     0%, 100% { opacity: 0.2; transform: translateY(0px); }
//                     50%      { opacity: 1;   transform: translateY(-3px); }
//                 }
//             `}</style>
//         </div>
//     );
// };

"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";

export const Loading = () => {
    const [loading] = useAtom(loadingAtom);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef    = useRef<number>(0);

    useEffect(() => {
        if (!loading) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;

        const resize = () => {
            canvas.width  = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();

        const W = canvas.width;
        const H = canvas.height;
        let t = 0;

        // Partículas (células sanguíneas / oxigênio)
        type Cell = {
            x: number; y: number; vx: number; vy: number;
            r: number; alpha: number; color: string; pulse: number;
        };
        const cells: Cell[] = Array.from({ length: 18 }, (_, i) => ({
            x:     Math.random() * W,
            y:     Math.random() * H,
            vx:    (Math.random() - 0.5) * 0.6,
            vy:    (Math.random() - 0.5) * 0.6,
            r:     2 + Math.random() * 4,
            alpha: 0.15 + Math.random() * 0.35,
            color: Math.random() > 0.5 ? "#66cc99" : "#1a3a5c",
            pulse: Math.random() * Math.PI * 2,
        }));

        // ECG — traço do sinal cardíaco
        // Gera os pontos de um batimento (PQRST)
        function ecgY(x: number, phase: number): number {
            const p = ((x / W) * 2.5 + phase) % 1;
            if (p < 0.15) return Math.sin(p / 0.15 * Math.PI) * 6;          // onda P
            if (p < 0.30) return 0;
            if (p < 0.34) return -Math.sin((p - 0.30) / 0.04 * Math.PI) * 8; // Q
            if (p < 0.38) return Math.sin((p - 0.34) / 0.04 * Math.PI) * 38; // R pico
            if (p < 0.42) return -Math.sin((p - 0.38) / 0.04 * Math.PI) * 10;// S
            if (p < 0.55) return Math.sin((p - 0.42) / 0.13 * Math.PI) * 12; // T
            return 0;
        }

        function tick() {
            ctx.clearRect(0, 0, W, H);
            t += 0.012;

            // Fundo degradê suave
            const bg = ctx.createLinearGradient(0, 0, W, H);
            bg.addColorStop(0, "#f0f9f4");
            bg.addColorStop(1, "#e8f0f7");
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, W, H);

            // Grid de fundo (papel milimetrado hospitalar)
            ctx.save();
            ctx.strokeStyle = "rgba(102,204,153,0.12)";
            ctx.lineWidth = 0.5;
            const gridSize = 20;
            for (let gx = 0; gx < W; gx += gridSize) {
                ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
            }
            for (let gy = 0; gy < H; gy += gridSize) {
                ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
            }
            // Grid maior
            ctx.strokeStyle = "rgba(102,204,153,0.22)";
            ctx.lineWidth = 1;
            for (let gx = 0; gx < W; gx += gridSize * 5) {
                ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
            }
            for (let gy = 0; gy < H; gy += gridSize * 5) {
                ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
            }
            ctx.restore();

            // Células flutuantes
            cells.forEach(c => {
                c.x += c.vx; c.y += c.vy;
                c.pulse += 0.04;
                if (c.x < -10) c.x = W + 10;
                if (c.x > W + 10) c.x = -10;
                if (c.y < -10) c.y = H + 10;
                if (c.y > H + 10) c.y = -10;
                const rPulse = c.r * (1 + 0.25 * Math.sin(c.pulse));
                ctx.save();
                ctx.globalAlpha = c.alpha * (0.7 + 0.3 * Math.sin(c.pulse));
                // Forma elíptica (hemácia)
                ctx.beginPath();
                ctx.ellipse(c.x, c.y, rPulse * 1.6, rPulse, 0, 0, Math.PI * 2);
                ctx.fillStyle = c.color;
                ctx.fill();
                // Anel externo
                ctx.globalAlpha = c.alpha * 0.3;
                ctx.strokeStyle = c.color;
                ctx.lineWidth = 0.8;
                ctx.stroke();
                ctx.restore();
            });

            // ECG — linha principal
            const ecgCy = H * 0.5;
            const phase  = t * 0.8;

            // Rastro fantasma (trail)
            ctx.save();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "rgba(102,204,153,0.15)";
            ctx.beginPath();
            for (let x = 0; x <= W; x += 2) {
                const y = ecgCy - ecgY(x, phase - 0.08);
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.restore();

            // Linha principal com gradiente vibrante
            const lineGrad = ctx.createLinearGradient(0, 0, W, 0);
            lineGrad.addColorStop(0,   "rgba(26,58,92,0)");
            lineGrad.addColorStop(0.3, "#1a3a5c");
            lineGrad.addColorStop(0.6, "#66cc99");
            lineGrad.addColorStop(0.85,"#1a3a5c");
            lineGrad.addColorStop(1,   "rgba(26,58,92,0)");

            ctx.save();
            ctx.lineWidth   = 2.5;
            ctx.strokeStyle = lineGrad;
            ctx.shadowColor = "#66cc99";
            ctx.shadowBlur  = 10;
            ctx.beginPath();
            for (let x = 0; x <= W; x += 1) {
                const y = ecgCy - ecgY(x, phase);
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.restore();

            // Ponto vivo — cursor piscante
            const cursorX = (t * 180) % W;
            const cursorY = ecgCy - ecgY(cursorX, phase);
            ctx.save();
            ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 8);
            ctx.shadowColor = "#66cc99";
            ctx.shadowBlur  = 20;
            ctx.fillStyle   = "#66cc99";
            ctx.beginPath();
            ctx.arc(cursorX, cursorY, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 0.2 + 0.15 * Math.sin(t * 8);
            ctx.beginPath();
            ctx.arc(cursorX, cursorY, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // DNA helix — lateral direita
            const dnaX   = W * 0.88;
            const dnaH   = H * 0.55;
            const dnaTop = H * 0.22;
            const dnaAmp = 12;
            const steps  = 20;

            for (let i = 0; i <= steps; i++) {
                const progress = i / steps;
                const y1 = dnaTop + progress * dnaH;
                const x1 = dnaX + Math.sin(progress * Math.PI * 4 + t * 2) * dnaAmp;
                const x2 = dnaX + Math.sin(progress * Math.PI * 4 + t * 2 + Math.PI) * dnaAmp;

                if (i > 0) {
                    // Filamentos
                    ctx.save();
                    ctx.globalAlpha = 0.5;
                    ctx.strokeStyle = "#1a3a5c";
                    ctx.lineWidth   = 1.5;
                    const prevY   = dnaTop + ((i - 1) / steps) * dnaH;
                    const prevX1  = dnaX + Math.sin(((i-1)/steps) * Math.PI * 4 + t * 2) * dnaAmp;
                    const prevX2  = dnaX + Math.sin(((i-1)/steps) * Math.PI * 4 + t * 2 + Math.PI) * dnaAmp;
                    ctx.beginPath(); ctx.moveTo(prevX1, prevY); ctx.lineTo(x1, y1); ctx.stroke();
                    ctx.strokeStyle = "#66cc99";
                    ctx.beginPath(); ctx.moveTo(prevX2, prevY); ctx.lineTo(x2, y1); ctx.stroke();
                    ctx.restore();
                }

                // Degraus
                if (i % 2 === 0) {
                    ctx.save();
                    ctx.globalAlpha = 0.35;
                    ctx.strokeStyle = i % 4 === 0 ? "#1a3a5c" : "#66cc99";
                    ctx.lineWidth   = 1;
                    ctx.setLineDash([2, 2]);
                    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y1); ctx.stroke();
                    ctx.restore();
                }

                // Nós do DNA
                [x1, x2].forEach((nx, ni) => {
                    ctx.save();
                    ctx.globalAlpha = 0.7;
                    ctx.fillStyle   = ni === 0 ? "#1a3a5c" : "#66cc99";
                    ctx.shadowColor = ni === 0 ? "#1a3a5c" : "#66cc99";
                    ctx.shadowBlur  = 6;
                    ctx.beginPath();
                    ctx.arc(nx, y1, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                });
            }

            // Coração pulsante central no topo
            const hx   = W / 2;
            const hy   = H * 0.18;
            const beat = 1 + 0.18 * Math.abs(Math.sin(t * 3.5));
            ctx.save();
            ctx.translate(hx, hy);
            ctx.scale(beat, beat);
            ctx.font      = "28px serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowColor  = "#ff6b8a";
            ctx.shadowBlur   = 14 * beat;
            ctx.fillText("♥", 0, 0);
            ctx.restore();

            // Texto "carregando" com pulso
            ctx.save();
            ctx.font         = "600 11px 'Courier New', monospace";
            ctx.textAlign    = "center";
            ctx.fillStyle    = "#1a3a5c";
            ctx.globalAlpha  = 0.5 + 0.3 * Math.sin(t * 2);
            ctx.letterSpacing = "0.3em";
            ctx.fillText("CARREGANDO", W / 2, H * 0.84);
            ctx.restore();

            // BPM contador fictício animado
            const bpm = Math.round(68 + Math.sin(t * 0.7) * 4);
            ctx.save();
            ctx.font      = "bold 13px 'Courier New', monospace";
            ctx.fillStyle = "#66cc99";
            ctx.globalAlpha = 0.7;
            ctx.textAlign = "left";
            ctx.fillText(`${bpm} bpm`, 14, H * 0.84);
            ctx.restore();

            rafRef.current = requestAnimationFrame(tick);
        }

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [loading]);

    if (!loading) return null;

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(240,249,244,0.92)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
        }}>
            <canvas
                ref={canvasRef}
                style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
            />
        </div>
    );
};