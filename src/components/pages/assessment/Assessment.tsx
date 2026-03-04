"use client";

import { useAtom } from "jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { montserrat } from "../dass21/Dass21";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/ui/Button";

interface Props {
    idConsult:    string;
    beneficiario: string;
}

export default function Assessment({ idConsult, beneficiario }: Props) {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const router = useRouter();

    const [estrelas, setEstrelas]     = useState(0);
    const [hover, setHover]           = useState(0);
    const [comentario, setComentario] = useState("");
    const [enviado, setEnviado]       = useState(false);

    const enviar = async () => {
        if (estrelas === 0) return;
        try {
            setIsLoading(true);
            await api.post(`/appointments/${idConsult}/avaliacao`, {
                stars:   estrelas,
                comment: comentario,
            }, configApi());
            setEnviado(true);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (enviado) {
        return (
            <div className={`${montserrat.className} flex flex-col items-center justify-center min-h-[60vh] px-6 text-center`}>
                <div className="text-5xl mb-4">💚</div>
                <h2 className="text-lg font-extrabold text-brand-500 mb-2">Obrigado pela avaliação!</h2>
                <p className="text-sm text-brand-300 mb-8">Seu feedback é muito importante para nós.</p>
                <button
                    onClick={() => router.push("/home")}
                    className="w-full max-w-xs py-3 rounded-2xl bg-brand-500 text-white font-bold text-sm"
                >
                    Voltar para o início
                </button>
            </div>
        );
    }

    return (
        <div className={`${montserrat.className} px-4 py-6`}>

            {/* Header */}
            <div
                className="rounded-2xl p-5 mb-6 flex flex-col gap-1"
                style={{ background: "linear-gradient(135deg,#1a3a5c,#122942)", boxShadow: "0 4px 20px rgba(26,58,92,0.2)" }}
            >
                <p className="text-[11px] font-semibold text-brand-2-300 uppercase tracking-widest">Avaliação</p>
                <h1 className="text-lg font-extrabold text-white leading-tight">Como foi sua consulta?</h1>
                {/* <p className="text-sm text-white/60 mt-1">Beneficiário: <span className="text-white/90 font-semibold">{beneficiario}</span></p> */}
            </div>

            {/* Estrelas */}
            <div
                className="bg-white rounded-2xl p-6 mb-4 flex flex-col items-center"
                style={{ boxShadow: "0 2px 12px rgba(26,58,92,0.08)", border: "1px solid #e8edf2" }}
            >
                <p className="text-sm font-bold text-brand-500 mb-4">Selecione uma nota</p>

                <div className="flex gap-3 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setEstrelas(s)}
                            onMouseEnter={() => setHover(s)}
                            onMouseLeave={() => setHover(0)}
                            style={{
                                fontSize: 40,
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                filter: s <= (hover || estrelas)
                                    ? "drop-shadow(0 0 6px rgba(255,200,0,0.6))"
                                    : "none",
                                transition: "transform 0.15s, filter 0.15s",
                                transform: s <= (hover || estrelas) ? "scale(1.2)" : "scale(1)",
                            }}
                        >
                            {s <= (hover || estrelas) ? "⭐" : "☆"}
                        </button>
                    ))}
                </div>

                <p className="text-xs font-semibold text-brand-300">
                    {estrelas === 0 && "Toque em uma estrela"}
                    {estrelas === 1 && "Ruim"}
                    {estrelas === 2 && "Regular"}
                    {estrelas === 3 && "Bom"}
                    {estrelas === 4 && "Muito bom"}
                    {estrelas === 5 && "Excelente! 🎉"}
                </p>
            </div>

            {/* Comentário */}
            <div
                className="bg-white rounded-2xl p-5 mb-6"
                style={{ boxShadow: "0 2px 12px rgba(26,58,92,0.08)", border: "1px solid #e8edf2" }}
            >
                <p className="text-sm font-bold text-brand-500 mb-3">
                    Comentário <span className="text-brand-200 font-normal">(opcional)</span>
                </p>
                <textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Conte como foi sua experiência..."
                    rows={4}
                    className="w-full text-sm text-brand-500 placeholder-brand-200 bg-gray-50 border border-brand-50 rounded-xl p-3 resize-none outline-none focus:border-brand-2-300 transition-colors"
                />
            </div>

            {/* <button
                type="button"
                onClick={enviar}
                disabled={estrelas === 0}
                className="w-full py-4 rounded-2xl font-bold text-sm text-white transition-all"
                style={{
                    background: estrelas === 0
                        ? "#a2bcce"
                        : "linear-gradient(135deg,#1a3a5c,#339966)",
                    boxShadow: estrelas === 0 ? "none" : "0 4px 16px rgba(26,58,92,0.25)",
                    cursor: estrelas === 0 ? "not-allowed" : "pointer",
                }}
            >
                {estrelas === 0 ? "Selecione uma nota para continuar" : "Enviar Avaliação"}
            </button> */}
            <Button onClick={enviar} disabled={estrelas === 0} type="button" variant="secondary" className="w-full" size="sm">{estrelas === 0 ? "Selecione uma nota para continuar" : "Enviar Avaliação"}</Button>
        </div>
    );
}