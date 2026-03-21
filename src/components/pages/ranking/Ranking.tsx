"use client";

import { useAtom } from "jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useEffect, useState } from "react";
import { montserrat } from "../dass21/Dass21";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/accordion/AccordionContent";
import { MdFilterAltOff } from "react-icons/md";
import { FaLightbulb, FaMoon, FaRegMoon } from "react-icons/fa";
import { CgEditBlackPoint } from "react-icons/cg";
import { CheckInManhaAnimation, CheckInNoiteAnimation, LevelUpAnimation } from "@/components/animations/Animations";
import { IoIosWarning } from "react-icons/io";
import Button from "@/ui/Button";
import { SiLevelsdotfyi } from "react-icons/si";

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
    level: number;
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
    
    const getStreakStyle = (streak: number) => {
        if (streak === 0)  return { color: "#9ca3af", icon: "🔥" };  // cinza
        if (streak < 3)    return { color: "#fb923c", icon: "🔥" };  // laranja
        if (streak < 7)    return { color: "#f97316", icon: "🔥" };  // laranja forte
        if (streak < 14)   return { color: "#ef4444", icon: "🔥" };  // vermelho
        if (streak < 30)   return { color: "#a855f7", icon: "⚡" };  // roxo + raio
        return                    { color: "#ffd700", icon: "👑" };  // dourado + coroa
    };

    const streak = getStreakStyle(entry.streak);
    
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

                <span style={{ color: streak.color }} className="text-[11px] font-semibold">
                    <span style={{ filter: `sepia(1) saturate(10) hue-rotate(${
                        entry.streak === 0  ? "0deg" :
                        entry.streak < 3  ? "340deg" :
                        entry.streak < 7  ? "350deg" :
                        entry.streak < 14 ? "320deg" :
                        entry.streak < 30 ? "240deg" :
                        "40deg"
                    })` }}>{streak.icon}</span>
                    {" "}{entry.streak}d
                </span>
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
                        className="text-[11px] font-semibold text-center truncate max-w-20"
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


export default function Ranking() {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [tab, setTab]     = useState(0);
    const [ranking, setRanking]   = useState<RankEntry[]>([]);
    const [myEntry, setMyEntry]   = useState<RankEntry | null>(null);
    const [loading, setLoading]   = useState(true);
    
    const normalizeLevel = (points: number) => {
        if(points >= 0 && points < 2000) return 1;
        if(points >= 2000 && points < 3000) return 2;
        return 3;
    }

    const getAll = async () => {
        try {
            setIsLoading(true);
            setLoading(true);

            const [
                { data: recipientsData },
                { data: vitalsData },
                { data: loggedData },
            ] = await Promise.all([
                api.get("/customer-recipients/ranking?deleted=false", configApi()),
                api.get("/vitals?deleted=false",                      configApi()),
                api.get("/customer-recipients/logged",                configApi()),
            ]);

            const recipients: any[] = recipientsData?.result?.data ?? [];
            const vitals: any[]     = vitalsData?.result?.data     ?? [];
            const loggedId: string  = loggedData?.result?.data?.id ?? "";

            const entries: RankEntry[] = recipients.map((r: any) => {
                const myVitals    = vitals.filter((v: any) => v.beneficiaryId === r.id);
                const checkIns    = myVitals.length;
                const streak      = myVitals.length > 0 ? myVitals[myVitals.length - 1].sequenceCheckIn : 0;
                
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
                    vitals:     1,
                    streak,
                    rank:       0,
                    levelIndex: getLevelIndex(points),
                    progress:   getLevelProgress(points),
                    level: normalizeLevel(points)
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
            console.log(error)
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

    const calculateStreak = (records: any[]): number => {
        if (!records || records.length === 0) return 0;

        const dates = Array.from(
            new Set(
                records.map(r => new Date(r.createdAt).toISOString().split('T')[0])
            )
        ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        const yesterdayDate = new Date();
        yesterdayDate.setDate(now.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        if (dates[0] !== today && dates[0] !== yesterday) {
            return 0;
        }

        let streak = 0;
        
        for (let i = 0; i < dates.length; i++) {
            const current = new Date(dates[i]);
            
            if (i === 0) {
                streak++;
                continue;
            }

            const previous = new Date(dates[i - 1]);
            const diffInMs = previous.getTime() - current.getTime();
            const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

            if (diffInDays === 1) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    };

    return (
        <div className={`${montserrat.className} mb-4`}>
            <div className={`${montserrat.className} bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden`}
                style={{ boxShadow: "0 2px 12px rgba(26,58,92,0.08)" }}>
                <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ background: "linear-gradient(135deg,#1a3a5c,#122942)" }}>
                    <div>
                        <p className="text-[10px] font-semibold text-brand-2-300 uppercase tracking-widest">Ranking</p>
                        <h2 className="text-sm font-extrabold text-white leading-tight">Top Saúde do Mês</h2>
                    </div>

                    <div className="flex gap-4">
                        <Link href="/home">
                            <div className="flex items-center gap-1 text-[11px] font-bold text-brand-2-300 bg-brand-2-300/10 border border-brand-2-300/30 px-2.5 py-1 rounded-lg">
                                Voltar
                            </div>
                        </Link>
                    </div>
                </div>

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
                        <Podium top3={top3} />
                    </div>
                )}
            </div>
            <Link href="/home/historic-points">
                <Button type="button" variant="secondary" className="w-full">
                    Hitórico de Pontos
                </Button>
            </Link>

            {myEntry && (
                <div
                    className="mb-4 mt-4 rounded-2xl p-4 flex items-center gap-3"
                    style={{
                        background: "linear-gradient(135deg,#1a3a5c,#339966)",
                        boxShadow: "0 4px 20px rgba(26,58,92,0.25)",
                    }}>
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
                        <p className="text-xs font-extrabold text-brand-2-300">Lv.{myEntry.level}</p>
                        <p className="text-[9px] text-white/60">nível</p>
                    </div>
                </div>
            )}

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

            <Accordion multiple={false}>
                <AccordionItem id="ranking" className="mb-2">
                    <AccordionTrigger icon={<FaLightbulb />} subtitle="Veja como funciona a pontuação do Ranking">
                        Como ganhar mais pontos?
                    </AccordionTrigger>
                    <AccordionContent>
                        <ul className="pt-3 flex flex-col gap-3">
                            <li className="text-xs text-gray-500 flex items-center gap-3">
                                <span className="text-xl">☀️</span>
                                <span className="flex-1">Check-in da <strong>manhã</strong> (como foi seu sono)</span>
                                <span className="text-brand-2-500 font-bold whitespace-nowrap">+5 pts</span>
                            </li>
                            <li className="text-xs text-gray-500 flex items-center gap-3">
                                <span className="text-xl">🥗</span>
                                <span className="flex-1">Check-in da <strong>noite</strong> (sua alimentação)</span>
                                <span className="text-brand-2-500 font-bold whitespace-nowrap">+5 pts</span>
                            </li>
                            <li className="text-xs text-gray-500 flex items-center gap-3">
                                <span className="text-xl">🧠</span>
                                <span className="flex-1">Check-in da <strong>noite</strong> (sua saúde mental)</span>
                                <span className="text-brand-2-500 font-bold whitespace-nowrap">+5 pts</span>
                            </li>
                        </ul>

                        <div className="flex items-center gap-2 text-brand-2-500 mt-4 mb-2">
                            <IoIosWarning />
                            <span className="text-xs font-semibold">Bônus por sequência 🔥</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">
                            Faça check-in <strong>dias seguidos</strong> e ganhe pontos extras por consistência.
                        </p>
                        <ul className="flex flex-col gap-2">
                            <li className="text-xs text-gray-500 flex items-center gap-3">
                                <span className="text-xl">🔥</span>
                                <span className="flex-1">Sequência no check-in do sono</span>
                                <span className="text-brand-2-500 font-bold whitespace-nowrap">+1 pt/dia</span>
                            </li>
                            <li className="text-xs text-gray-500 flex items-center gap-3">
                                <span className="text-xl">🔥</span>
                                <span className="flex-1">Sequência no check-in da alimentação</span>
                                <span className="text-brand-2-500 font-bold whitespace-nowrap">+1 pt/dia</span>
                            </li>
                            <li className="text-xs text-gray-500 flex items-center gap-3">
                                <span className="text-xl">🔥</span>
                                <span className="flex-1">Sequência no check-in mental</span>
                                <span className="text-brand-2-500 font-bold whitespace-nowrap">+1 pt/dia</span>
                            </li>
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <Accordion multiple={false}>
                <AccordionItem id="ranking" className="mb-2">
                    <AccordionTrigger icon={<SiLevelsdotfyi />} subtitle="Veja como pode subir de nível">
                        Como avançar de nível?
                    </AccordionTrigger>
                    <AccordionContent>
                        <ul className="pt-3 flex flex-col gap-3">
                            <li className="text-xs text-gray-500 flex items-center gap-3">
                                <span className="text-xl">⭐</span>
                                <span className="flex-1">Nível <strong>1</strong></span>
                                <span className="text-brand-2-500 font-bold whitespace-nowrap">1.000 pts</span>
                            </li>
                            <li className="text-xs text-gray-500 flex items-center gap-3">
                                <span className="text-xl">🌟</span>
                                <span className="flex-1">Nível <strong>2</strong></span>
                                <span className="text-brand-2-500 font-bold whitespace-nowrap">2.000 pts</span>
                            </li>
                            <li className="text-xs text-gray-500 flex items-center gap-3">
                                <span className="text-xl">🚀</span>
                                <span className="flex-1">Nível <strong>3</strong></span>
                                <span className="text-brand-2-500 font-bold whitespace-nowrap">3.000 pts</span>
                            </li>
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-brand-500">Top Beneficiários</span>
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
        </div>
    );
}