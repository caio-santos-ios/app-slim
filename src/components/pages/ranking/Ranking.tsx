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
    progress: number;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const LEVELS = [
    { min: 0,    name: "Iniciante Saudável",  color: "#a2bcce" },
    { min: 200,  name: "Explorador Saudável", color: "#66cc99" },
    { min: 500,  name: "Cuidador Ativo",      color: "#4db380" },
    { min: 900,  name: "Protetor de Vida",    color: "#457091" },
    { min: 1400, name: "Guardião da Saúde",   color: "#1a3a5c" },
];

const TABS = ["Geral", "Check-in", "Sinais Vitais"];

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

function getLevelProgress(points: number) {
    const idx = getLevelIndex(points);
    const current = LEVELS[idx].min;
    const next = LEVELS[idx + 1]?.min ?? current + 500;
    return Math.min(100, Math.round(((points - current) / (next - current)) * 100));
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

function ProgressBar({ value, color }: { value: number; color: string }) {
    return (
        <div style={{ height: 4, background: "#e8edf2", borderRadius: 8, overflow: "hidden", width: "100%" }}>
            <div style={{
                height: "100%",
                width: `${value}%`,
                background: `linear-gradient(90deg, ${color}, ${color}bb)`,
                borderRadius: 8,
                transition: "width 0.6s ease",
            }} />
        </div>
    );
}

function Avatar({ name, photo, points, size = 44 }: {
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
    //                 width: size,
    //                 height: size,
    //                 borderRadius: "50%",
    //                 objectFit: "cover",
    //                 border: `2.5px solid ${color}`,
    //                 boxShadow: `0 0 0 2px ${color}33`,
    //                 flexShrink: 0,
    //             }}
    //         />
    //     );
    // }

    return (
        <div style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${color}, ${color}99)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.33,
            fontWeight: 700,
            color: "#fff",
            border: `2.5px solid ${color}`,
            boxShadow: `0 0 0 2px ${color}33`,
            flexShrink: 0,
            letterSpacing: 1,
        }}>
            {getInitials(name)}
        </div>
    );
}

function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) return (
        <div style={{
            width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg,#FFD700,#FFA500)",
            boxShadow: "0 0 12px rgba(255,215,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>🏆</div>
    );
    if (rank === 2) return (
        <div style={{
            width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg,#C0C0C0,#A8A8A8)",
            boxShadow: "0 0 8px rgba(192,192,192,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>🥈</div>
    );
    if (rank === 3) return (
        <div style={{
            width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg,#CD7F32,#A0522D)",
            boxShadow: "0 0 8px rgba(205,127,50,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>🥉</div>
    );
    return (
        <div style={{
            width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
            background: "#e8edf2",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#1a3a5c",
        }}>{rank}</div>
    );
}

function UserRow({ entry, isMe = false }: { entry: RankEntry; isMe?: boolean }) {
    const level = getLevel(entry.points);
    return (
        <div
            className={`flex items-center gap-3 p-3 rounded-2xl border mb-2 ${isMe ? "border-brand-2-300 bg-brand-2-25" : "border-gray-100 bg-white"}`}
            style={{ boxShadow: isMe ? "0 4px 16px rgba(102,204,153,0.15)" : "0 1px 4px rgba(26,58,92,0.06)" }}
        >
            <RankBadge rank={entry.rank} />
            <Avatar name={entry.name} photo={entry.photo} points={entry.points} size={42} />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-brand-500 truncate">{entry.name}</span>
                    {isMe && (
                        <span className="text-[9px] font-bold bg-brand-2-300 text-white px-1.5 py-0.5 rounded-full shrink-0">
                            VOCÊ
                        </span>
                    )}
                </div>
                <div className="text-[10px] font-semibold mb-1" style={{ color: level.color }}>
                    Lv.{entry.levelIndex + 1} · {level.name}
                </div>
                <ProgressBar value={entry.progress} color={level.color} />
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-sm font-extrabold text-brand-500">
                    {entry.points.toLocaleString("pt-BR")}
                </span>
                <span className="text-[10px] text-brand-300">pontos</span>
                <span className="text-[11px] font-semibold text-orange-400">🔥 {entry.streak}d</span>
            </div>
        </div>
    );
}

function Podium({ top3 }: { top3: RankEntry[] }) {
    if (top3.length < 3) return null;

    const order    = [top3[1], top3[0], top3[2]];
    const heights  = [100, 130, 90];
    const medals   = ["🥈", "🏆", "🥉"];
    const rankNums = [2, 1, 3];
    const bgs = [
        "linear-gradient(180deg,#6d93b0,#457091)",
        "linear-gradient(180deg,#1a3a5c,#122942)",
        "linear-gradient(180deg,#a2bcce,#6d93b0)",
    ];

    return (
        <div className="flex items-end justify-center gap-1.5 px-2">
            {order.map((u, i) => (
                <div key={u.id} className="flex flex-col items-center flex-1">
                    <div className="text-xl mb-1" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}>
                        {medals[i]}
                    </div>
                    <div className="relative mb-1.5">
                        {i === 1 && (
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-base">👑</div>
                        )}
                        <Avatar name={u.name} photo={u.photo} points={u.points} size={i === 1 ? 60 : 50} />
                    </div>
                    <p
                        className="text-[11px] font-semibold text-center truncate max-w-[80px]"
                        style={{ color: i === 1 ? "white" : "#cedbe6" }}
                    >
                        {u.name.split(" ")[0]}
                    </p>
                    <p className="text-xs font-bold mb-1.5" style={{ color: i === 1 ? "#66cc99" : "#6d93b0" }}>
                        {u.points.toLocaleString("pt-BR")} pts
                    </p>
                    <div
                        className="w-full rounded-t-lg flex items-center justify-center"
                        style={{ height: heights[i], background: bgs[i] }}
                    >
                        <span className="font-black text-white" style={{ fontSize: i === 1 ? 28 : 22 }}>
                            #{rankNums[i]}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Ranking() {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [tab, setTab]     = useState(0);
    const [ranking, setRanking]   = useState<RankEntry[]>([]);
    const [myEntry, setMyEntry]   = useState<RankEntry | null>(null);
    const [loading, setLoading]   = useState(true);

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
                api.get("/historics",             configApi()),
                api.get("/vitals",                configApi()),
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
                const points      = (checkIns * PTS_CHECKIN) + (vitalCount * PTS_VITAL) + (streak * PTS_STREAK);

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
                    progress:   getLevelProgress(points),
                };
            });

            const sorted = [...entries]
                .sort((a, b) => {
                    if (tab === 1) return b.checkIns - a.checkIns;
                    if (tab === 2) return b.vitals - a.vitals;
                    return b.points - a.points;
                })
                .map((e, i) => ({ ...e, rank: i + 1 }));

            setRanking(sorted);
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
    }, [tab]);

    const top3    = ranking.slice(0, 3);
    const isInTop = myEntry ? myEntry.rank <= 20 : false;

    const myStats = myEntry
        ? [
            { icon: "📅", label: "Check-ins", value: myEntry.checkIns },
            { icon: "🔥", label: "Sequência", value: `${myEntry.streak}d` },
            { icon: "⭐", label: "Nível",     value: myEntry.levelIndex + 1 },
            { icon: "🎯", label: "Posição",   value: `#${myEntry.rank}` },
        ]
        : [];

    return (
        <div className={`${montserrat.className} mb-4`}>
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
                    <Link href="/home">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-brand-2-300 bg-brand-2-300/10 border border-brand-2-300/30 px-2.5 py-1 rounded-lg">
                            Voltar
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
                    <div className="px-3 pt-4" style={{ background: "linear-gradient(180deg,#0f2135 0%,#1a3a5c 100%)" }}>
                        {/* <div className="flex items-end justify-center gap-2">
                            {podiumOrder.map((entry, i) => (
                                <PodiumItem key={entry.id} entry={entry} position={podiumPositions[i]} />
                            ))}
                        </div> */}
                        <Podium top3={top3} />
                    </div>
                )}

                {/* {myEntry && (
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
                )} */}
            </div>

            {/* <div
                className="rounded-b-3xl mb-5 overflow-hidden"
                style={{
                    background: "linear-gradient(160deg,#1a3a5c 0%,#122942 60%,#0f2135 100%)",
                    boxShadow: "0 8px 32px rgba(26,58,92,0.3)",
                }}
            >
                <div className="flex items-center justify-between px-4 pt-4 pb-4">
                    <div>
                        <p className="text-[11px] font-semibold text-brand-2-300 uppercase tracking-widest">Pasbem</p>
                        <h1 className="text-xl font-extrabold text-white leading-tight">Ranking de Saúde</h1>
                    </div>
                    <div className="text-[11px] font-bold text-brand-2-300 px-3 py-1.5 rounded-xl border border-brand-2-300/30 bg-brand-2-300/10">
                        🏆 {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 rounded-full border-2 border-brand-2-300/30 border-t-brand-2-300 animate-spin" />
                    </div>
                ) : (
                    <Podium top3={top3} />
                )}

                <div className="flex gap-1 mx-3 mt-4 bg-white/10 rounded-t-xl p-1.5 pb-0">
                    {TABS.map((t, i) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTab(i)}
                            className={`flex-1 py-2 text-[11px] font-semibold rounded-t-lg transition-all border-none cursor-pointer
                                ${tab === i ? "bg-brand-25 text-brand-500" : "bg-transparent text-white/50"}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div> */}

            {myEntry && (
                <div
                    className="mb-4 rounded-2xl p-4 flex items-center gap-3"
                    style={{
                        background: "linear-gradient(135deg,#1a3a5c,#339966)",
                        boxShadow: "0 4px 20px rgba(26,58,92,0.25)",
                    }}
                >
                    <Avatar name={myEntry.name} photo={myEntry.photo} points={myEntry.points} size={48} />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/70 mb-0.5">Sua posição atual</p>
                        <p className="text-base font-extrabold text-white">
                            #{myEntry.rank} — {myEntry.points.toLocaleString("pt-BR")} pts
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                            <ProgressBar value={myEntry.progress} color="#66cc99" />
                            <span className="text-[10px] text-white/70 shrink-0">{myEntry.progress}%</span>
                        </div>
                    </div>
                    <div className="shrink-0 bg-brand-2-300/25 rounded-xl px-3 py-2 text-center">
                        <p className="text-xs font-extrabold text-brand-2-300">Lv.{myEntry.levelIndex + 1}</p>
                        <p className="text-[9px] text-white/60">nível</p>
                    </div>
                </div>
            )}

            {/* Stats */}
            {myStats.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {myStats.map((s) => (
                        <div
                            key={s.label}
                            className="bg-white rounded-xl p-2 text-center border border-brand-50"
                            style={{ boxShadow: "0 1px 4px rgba(26,58,92,0.08)" }}
                        >
                            <div className="text-lg mb-0.5">{s.icon}</div>
                            <div className="text-sm font-extrabold text-brand-500">{s.value}</div>
                            <div className="text-[9px] font-semibold text-brand-300">{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lista */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-brand-500">Top Beneficiários</span>
                <span className="text-xs text-brand-300">{ranking.length} participantes</span>
            </div>

            {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-16 rounded-2xl bg-white border border-brand-50 mb-2 animate-pulse"
                        style={{ opacity: 1 - i * 0.15 }}
                    />
                ))
            ) : (
                <div>
                    {ranking.slice(0, 20).map((entry) => (
                        <UserRow key={entry.id} entry={entry} isMe={myEntry?.id === entry.id} />
                    ))}

                    {myEntry && !isInTop && (
                        <>
                            <div className="flex items-center gap-2 my-2">
                                <div className="flex-1 h-px bg-brand-50" />
                                <span className="text-[10px] text-brand-200">• • •</span>
                                <div className="flex-1 h-px bg-brand-50" />
                            </div>
                            <UserRow entry={myEntry} isMe />
                        </>
                    )}
                </div>
            )}

            {/* Dica */}
            <div className="mt-2 rounded-2xl p-4 flex items-center gap-3 border border-brand-2-100 bg-brand-2-25">
                <span className="text-2xl shrink-0">💡</span>
                <div>
                    <p className="text-xs font-bold text-brand-500 mb-0.5">Como ganhar mais pontos</p>
                    <p className="text-[11px] text-brand-400 leading-relaxed">
                        Check-in diário (+{PTS_CHECKIN}pts) · Sinais Vitais (+{PTS_VITAL}pts) · Sequência (+{PTS_STREAK}pts/dia)
                    </p>
                </div>
            </div>
        </div>
    );
}