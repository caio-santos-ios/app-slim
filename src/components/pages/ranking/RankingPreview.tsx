"use client";

import { useAtom } from "jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useEffect, useState } from "react";
import { montserrat } from "../dass21/Dass21";
import Link from "next/link";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface RankEntry {
    id: string;
    name: string;
    photo: string;
    points: number;
    checkIns: number;
    vitals: number;
    streak: number;
    rank: number;
    levelIndex: number;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const LEVELS = [
    { min: 0,    name: "Iniciante",  color: "#a2bcce" },
    { min: 200,  name: "Explorador", color: "#66cc99" },
    { min: 500,  name: "Cuidador",   color: "#4db380" },
    { min: 900,  name: "Protetor",   color: "#457091" },
    { min: 1400, name: "Guardião",   color: "#1a3a5c" },
];

const PTS_CHECKIN = 10;
const PTS_VITAL   = 15;
const PTS_STREAK  = 5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLevel(points: number) {
    return [...LEVELS].reverse().find((l) => points >= l.min) ?? LEVELS[0];
}

function getLevelIndex(points: number) {
    const idx = [...LEVELS].reverse().findIndex((l) => points >= l.min);
    return idx === -1 ? 0 : LEVELS.length - 1 - idx;
}

function getInitials(name: string) {
    return name
        .split(" ")
        .slice(0, 2)
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();
}

function calcStreak(historics: any[], recipientId: string): number {
    const days = historics
        .filter((h: any) => h.recipient === recipientId)
        .map((h: any) => new Date(h.createdAt).toDateString());

    const unique = [...new Set(days)].sort(
        (a, b) => new Date(b as string).getTime() - new Date(a as string).getTime()
    );

    let streak = 0;
    let current = new Date();

    for (const day of unique) {
        const d = new Date(day as string);
        const diff = Math.round((current.getTime() - d.getTime()) / 86400000);
        if (diff <= 1) { streak++; current = d; }
        else break;
    }
    return streak;
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Avatar({ name, photo, points, size = 40 }: {
    name: string;
    photo: string;
    points: number;
    size?: number;
}) {
    const color = getLevel(points).color;

    // if (photo) {
    //     return (
    //         <img
    //             src={photo}
    //             alt={name}
    //             style={{
    //                 width: size, height: size,
    //                 borderRadius: "50%",
    //                 objectFit: "cover",
    //                 border: `2px solid ${color}`,
    //                 flexShrink: 0,
    //             }}
    //         />
    //     );
    // }
    return (
        <div style={{
            width: size, height: size,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${color}, ${color}99)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: size * 0.33, fontWeight: 700, color: "#fff",
            border: `2px solid ${color}`,
            flexShrink: 0, letterSpacing: 1,
        }}>
            {getInitials(name)}
        </div>
    );
}

function PodiumItem({ entry, position }: { entry: RankEntry; position: number }) {
    const isFirst   = position === 1;
    const medal     = position === 1 ? "🏆" : position === 2 ? "🥈" : "🥉";
    const nameColor = isFirst ? "white" : "#cedbe6";
    const ptsColor  = isFirst ? "#66cc99" : "#6d93b0";
    const heights   = { 1: 70, 2: 50, 3: 40 };
    const bgs       = {
        1: "linear-gradient(180deg,#1a3a5c,#122942)",
        2: "linear-gradient(180deg,#6d93b0,#457091)",
        3: "linear-gradient(180deg,#a2bcce,#6d93b0)",
    };
    const size = isFirst ? 52 : 42;

    return (
        <div className="flex flex-col items-center flex-1">
            <div className="mb-1" style={{ fontSize: isFirst ? 20 : 16, filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.25))" }}>
                {medal}
            </div>
            <div className="relative mb-1">
                {isFirst && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-sm">👑</div>
                )}
                <Avatar name={entry.name} photo={entry.photo} points={entry.points} size={size} />
            </div>
            <p className="text-[10px] font-semibold text-center truncate max-w-18 mb-0.5"
                style={{ color: nameColor }}>
                {entry.name.split(" ")[0]}
            </p>
            <p className="text-[10px] font-bold mb-1" style={{ color: ptsColor }}>
                {entry.points.toLocaleString("pt-BR")} pts
            </p>
            <div
                className="w-full rounded-t-lg flex items-center justify-center"
                style={{ height: heights[position as keyof typeof heights], background: bgs[position as keyof typeof bgs] }}
            >
                <span className="font-black text-white text-lg">#{(entry.points)}</span>
            </div>
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function RankingPreview() {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [top3, setTop3]       = useState<RankEntry[]>([]);
    const [myEntry, setMyEntry] = useState<RankEntry | null>(null);
    const [loading, setLoading] = useState(true);

    const getAll = async () => {
        try {
            setIsLoading(true);
            setLoading(true);

            const [
                { data: recipientsData },
                { data: historicsData },
                { data: vitalsData },
                { data: loggedData },
            ] = await Promise.all([
                api.get("/customer-recipients", configApi()),
                api.get("/historics",           configApi()),
                api.get("/vitals",              configApi()),
                api.get("/customer-recipients/logged", configApi()),
            ]);

            const recipients: any[] = recipientsData?.result?.data ?? [];
            const historics: any[]  = historicsData?.result?.data  ?? [];
            const vitals: any[]     = vitalsData?.result?.data     ?? [];
            const loggedId: string  = loggedData?.result?.data?.id ?? "";

            const entries: RankEntry[] = recipients.map((r: any) => {
                const myHistorics = historics.filter((h: any) => h.recipient === r.id);
                const myVitals    = vitals.filter((v: any) => v.beneficiaryId === r.id);
                const checkIns    = myHistorics.length;
                const vitalCount  = myVitals.length;
                const streak      = calcStreak(historics, r.id);
                const totalIGS = myVitals.reduce((a, b) => a + b.chekinIGSPoint, 0);
                const totalIGN = myVitals.reduce((a, b) => a + b.chekinIGNPoint, 0);
                const totalIES = myVitals.reduce((a, b) => a + b.chekinIESPoint, 0);
                const totalExtrasPoint = myVitals.reduce((a, b) => a + b.extrasPoint, 0);
                
                const points      = totalIGS + totalIGN + totalIES + totalExtrasPoint;

                return {
                    id:         r.id,
                    name:       r.name,
                    photo:      r.photo ?? "",
                    points,
                    checkIns,
                    vitals:     vitalCount,
                    streak,
                    rank:       0,
                    levelIndex: getLevelIndex(points),
                };
            });

            const sorted = [...entries]
                .sort((a, b) => b.points - a.points)
                .map((e, i) => ({ ...e, rank: i + 1 }));

            setTop3(sorted.slice(0, 3));
            setMyEntry(sorted.find((e) => e.id === loggedId) ?? null);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        getAll();
    }, []);

    const normalizeLevel = (points: number) => {
        if(points >= 0 && points < 2000) return 1;
        if(points >= 2000 && points < 3000) return 2;
        return 3;
    }

    // Ordem do pódio: 2º | 1º | 3º
    const podiumOrder = top3.length === 3
        ? [top3[1], top3[0], top3[2]]
        : [];
    const podiumPositions = [2, 1, 3];

    return (
        <div className={`${montserrat.className} bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden`}
            style={{ boxShadow: "0 2px 12px rgba(26,58,92,0.08)" }}>

            {/* Cabeçalho */}
            <div
                className="flex items-center justify-between px-4 py-3"
                style={{ background: "linear-gradient(135deg,#1a3a5c,#122942)" }}
            >
                <div>
                    <p className="text-[10px] font-semibold text-brand-2-300 uppercase tracking-widest">Ranking</p>
                    <h2 className="text-sm font-extrabold text-white leading-tight">Top Saúde do Mês</h2>
                </div>
                <Link href="/home/ranking">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-brand-2-300 bg-brand-2-300/10 border border-brand-2-300/30 px-2.5 py-1 rounded-lg">
                        Ver tudo →
                    </div>
                </Link>
            </div>

            {/* Pódio */}
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="w-6 h-6 rounded-full border-2 border-brand-2-300/30 border-t-brand-2-300 animate-spin" />
                </div>
            ) : top3.length < 3 ? (
                <div className="flex justify-center items-center py-8">
                    <p className="text-xs text-brand-300">Nenhum dado disponível ainda.</p>
                </div>
            ) : (
                <div
                    className="px-3 pt-4"
                    style={{ background: "linear-gradient(180deg,#0f2135 0%,#1a3a5c 100%)" }}
                >
                    <div className="flex items-end justify-center gap-2">
                        {podiumOrder.map((entry, i) => (
                            <PodiumItem key={entry.id} entry={entry} position={podiumPositions[i]} />
                        ))}
                    </div>
                </div>
            )}

            {/* Sua posição */}
            {myEntry && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-brand-50">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-2-25 border border-brand-2-200 flex items-center justify-center">
                            <span className="text-[10px] font-extrabold text-brand-2-500">#{myEntry.rank}</span>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-brand-500 leading-none">Sua posição</p>
                            <p className="text-[10px] text-brand-300 mt-0.5">
                                {getLevel(myEntry.points).name} · Lv.{myEntry.levelIndex + 1}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-extrabold text-brand-500">
                            {myEntry.points.toLocaleString("pt-BR")}
                        </p>
                        <p className="text-[10px] text-brand-300">pontos</p>
                    </div>
                </div>
            )}
        </div>
    );
}