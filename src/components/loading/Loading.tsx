"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { Logo } from "../logo/Logo";

export const Loading = () => {
    const [loading] = useAtom(loadingAtom);

    if (!loading) return null;

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(8px)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 28,
        }}>
            {/* Logo com anéis de pulso */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>

                {/* Anéis de pulso */}
                {[0, 1, 2].map(i => (
                    <div key={i} style={{
                        position: "absolute",
                        inset: -(12 + i * 10),
                        borderRadius: "50%",
                        border: `1.5px solid rgba(102,204,153,${0.6 - i * 0.15})`,
                        animation: "pulse-ring 2s ease-out infinite",
                        animationDelay: `${i * 0.5}s`,
                    }} />
                ))}

                {/* Logo */}
                <div style={{ animation: "breathe 2s ease-in-out infinite" }}>
                    <Logo className="h-40"/>
                </div>
            </div>

            {/* Texto */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <p style={{
                    fontSize: 11, letterSpacing: "0.25em", color: "#1a3a5c",
                    opacity: 0.5, fontWeight: 600, textTransform: "uppercase",
                    fontFamily: "monospace", margin: 0,
                    animation: "fadepulse 2s ease-in-out infinite",
                }}>
                    Carregando
                </p>

                {/* Dots */}
                <div style={{ display: "flex", gap: 7 }}>
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} style={{
                            width: i === 1 || i === 2 ? 8 : 6,
                            height: i === 1 || i === 2 ? 8 : 6,
                            borderRadius: "50%",
                            background: i === 1 || i === 2
                                ? "linear-gradient(135deg, #1a3a5c, #66cc99)"
                                : "#66cc99",
                            animation: "bounce 1.4s ease-in-out infinite",
                            animationDelay: `${i * 0.15}s`,
                            boxShadow: i === 1 || i === 2
                                ? "0 2px 8px rgba(102,204,153,0.5)"
                                : "none",
                        }} />
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes pulse-ring {
                    0%   { transform: scale(1);   opacity: 0.7; }
                    100% { transform: scale(1.55); opacity: 0; }
                }
                @keyframes breathe {
                    0%, 100% { transform: scale(1); }
                    50%      { transform: scale(1.07); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0);    opacity: 0.35; }
                    50%      { transform: translateY(-5px); opacity: 1; }
                }
                @keyframes fadepulse {
                    0%, 100% { opacity: 0.35; }
                    50%      { opacity: 0.65; }
                }
            `}</style>
        </div>
    );
};