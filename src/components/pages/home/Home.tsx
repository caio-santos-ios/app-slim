"use client";

import { useAtom } from "jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import VitalModal from "../vital-modal/VitalModal";
import { VitalCheckInAtom, VitalModalAtom } from "@/jotai/vital/vital.jotai";
import { configApi, isTokenExpiringSoon, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie, LabelList } from 'recharts';
import { FiAlertTriangle, FiPhone } from "react-icons/fi";
import { HiOutlineLightBulb } from "react-icons/hi";
import { FaVideo, FaRegMoon } from "react-icons/fa";
import { maskDate } from "@/utils/mask.util";
import { montserrat } from "../dass21/Dass21";
import Label from "@/components/form/LabelForm";
import Input from "@/components/form/input/Input";
import Button from "@/ui/Button";
import Link from "next/link";
import { IoIosNutrition } from "react-icons/io";
import { LuBrain } from "react-icons/lu";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Metric = { igs: number; ign: number; ies: number; ipv: number };
type Dass9  = { depression: number; anxiety: number; stress: number };

type InsightBlock = {
    icon: React.ReactNode;
    title: string;
    color: string;
    bg: string;
    border: string;
    insight: string;
    dose: string;
};

// ─── Helpers de insight/dose baseados na planilha ───────────────────────────

/** IPV geral */
function getIpvInsight(ipv: number) {
  if (ipv < 60)
    return {
      insight: "🔴 Sinal Vermelho: Sua biologia está sob estresse severo hoje.",
      dose:    "AÇÃO URGENTE: Descanse agora, hidrate-se e antecipe seu sono.",
    };
  if (ipv < 85)
    return {
      insight: "🟡 Atenção: Sua rotina precisa de ajustes para evitar fadiga crônica.",
      dose:    "AÇÃO RECOMENDADA: Foque em corrigir o pilar mais fraco amanhã.",
    };
  return {
    insight: "🟢 Excelente: Você está em alta performance vital.",
    dose:    "AÇÃO: Continue mantendo seus hábitos saudáveis.",
  };
}

/** IGS – Sono */
function getIgsInsight(igs: number, patologia?: string) {
  if (igs < 70)
    return {
      insight: "Privação de sono detectada. Isso reduz sua imunidade e foco amanhã.",
      dose:    "Dose de Saúde: Tente dormir 30min mais cedo hoje para compensar o déficit.",
    };
  if (igs < 85)
    return {
      insight: patologia
        ? `Sua condição de ${patologia} está limitando sua recuperação real. Tente relaxar antes de deitar.`
        : "Recuperação biológica pode ser melhorada. Tente relaxar antes de deitar.",
      dose: "Dose de Saúde: Coloque um alarme para 'preparação do sono' 1h antes do seu alvo.",
    };
  return {
    insight: "Boa qualidade de repouso. Seu sono está apoiando sua regeneração celular.",
    dose:    "Manter rotina. Sono contínuo e consistente atingido.",
  };
}

/** IGN – Nutrição */
function getIgnInsight(ign: number, patologia?: string) {
  if (ign < 70)
    return {
      insight: "O impacto glicêmico e os horários estão sobrecarregando seu metabolismo.",
      dose:    "Foco do dia: Alinhar horários de refeição e reduzir carga glicêmica.",
    };
  if (ign < 85)
    return {
      insight: patologia
        ? `Para seu perfil de ${patologia}, ajuste o horário da ceia para proteger seu metabolismo.`
        : "O horário da ceia pode estar impactando sua glicemia. Tente alinhar com o horário alvo.",
      dose: "Dose de Saúde: Programe sua última refeição para no máximo 2h antes de dormir.",
    };
  return {
    insight: "Metabolismo em equilíbrio. Alinhamento nutricional correto.",
    dose:    "Seguir plano alimentar. Ótima escolha de horários e carga glicêmica.",
  };
}

/** IES – Saúde Mental (DASS-9) — baseado no score total 0-27 */
function getIesInsight(dass9: Dass9) {
  const total = (dass9.depression || 0) + (dass9.anxiety || 0) + (dass9.stress || 0);
  if (total <= 5)
    return {
      insight: "Sua saúde emocional está resiliente hoje. Mantenha suas práticas de descompressão.",
      dose:    "Continue cultivando seu equilíbrio. Pratique o registro de gratidão.",
    };
  if (total <= 12)
    return {
      insight: "Nível leve/moderado de tensão detectado. Atenção ao seu estado emocional.",
      dose:    "Dose de Saúde: Realize 5min de respiração guiada agora.",
    };
  if (total <= 18)
    return {
      insight: "Sinais de estresse/ansiedade acentuados. Cuide-se com prioridade.",
      dose:    "Dose de Saúde: Antecipe seu horário de sono e evite telas à noite.",
    };
  return {
    insight: "Sobrecarga emocional severa detectada. Ação imediata necessária.",
    dose:    "Ação: Priorize o protocolo de descompressão e considere falar com um especialista.",
  };
}

/** Cor do card baseada no score */
function getScoreColors(score: number) {
  if (score < 60) return { text: "text-red-600",   bg: "bg-red-50",    border: "border-red-200" };
  if (score < 85) return { text: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" };
  return              { text: "text-green-600",  bg: "bg-green-50",  border: "border-green-200" };
}

/** Cor do gráfico de barra */
function GetBarColor(score: number) {
  if (score <= 60) return "#ff6467";
  if (score < 85)  return "#fdc700";
  return "#06df72";
}

// ─── Componente de Card de Insight ──────────────────────────────────────────

function InsightCard({ block }: { block: InsightBlock }) {
  return (
    <div className={`rounded-2xl border p-4 ${block.bg} ${block.border}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={block.color}>{block.icon}</span>
        <span className={`text-sm font-bold ${block.color}`}>{block.title}</span>
      </div>
      <p className={`text-sm font-medium ${block.color} mb-2`}>{block.insight}</p>
      <div className="bg-white/70 rounded-xl px-3 py-2 border border-current/10">
        <p className={`text-xs font-semibold ${block.color}`}>💊 {block.dose}</p>
      </div>
    </div>
  );
}

// ─── Componente Principal ────────────────────────────────────────────────────

const chartData = [{ value: 10 }, { value: 90 }];

export default function Home() {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [modal, setModal] = useAtom(VitalModalAtom);
  const [isCheckIn, setIsCheckIn] = useAtom(VitalCheckInAtom);
  const [nextTelemedicine, setNextTelemedicine] = useState<any>({ date: "" });
  const [metric, setMetric] = useState<Metric>({ igs: 0, ign: 0, ies: 0, ipv: 0 });
  const [metricWeek, setMetricWeek] = useState<any[]>([]);
  const [periodo, setPeriodo] = useState("Semana");
  const [dass9, setDass9] = useState<Dass9>({ depression: 0, anxiety: 0, stress: 0 });
  const [startDate, setStartDate] = useState<string>("sem");
  const [endDate, setEndDate] = useState<string>("sem");
  const [patologia, setPatologia] = useState<string>("");

  // Cores do IPV
  const getBarColor = (value: number) => {
    if (value <= 60) return "oklch(70.4% 0.191 22.216)";
    if (value < 85)  return "oklch(85.2% 0.199 91.936)";
    return "oklch(79.2% 0.209 151.711)";
  };

  const getColorMetric = (v: number) => {
    if (v <= 60) return "text-red-400";
    if (v < 85)  return "text-yellow-400";
    return "text-green-400";
  };

  const getColorDass9 = (score: number) => {
    if (score > 5) return "border bg-red-100 text-red-600 border-red-600";
    if (score >= 3) return "border bg-yellow-100 text-yellow-600 border-yellow-600";
    return "border bg-green-100 text-green-600 border-green-600";
  };

  // ── Fetches ───────────────────────────────────────────────────────────────

  const getAll = async (currentPeriod: string) => {
    try {
      if (currentPeriod.toLowerCase() === "personalizado") return;
      const { data } = await api.get(
        `/vitals/beneficiary/${currentPeriod.toLowerCase()}`,
        configApi()
      );
      const result = data.result.data;
      if (!result.id) setIsCheckIn(true);

      setDass9({
        depression: (result.dass1 || 0) + (result.dass2 || 0) + (result.dass3 || 0),
        anxiety:    (result.dass4 || 0) + (result.dass5 || 0) + (result.dass6 || 0),
        stress:     (result.dass7 || 0) + (result.dass8 || 0) + (result.dass9 || 0),
      });
      setMetric(result.metric);
      setMetricWeek(result.weekMetric);
    } catch (error) {
      resolveResponse(error);
    }
  };

  const getLogged = async () => {
    try {
      const { data } = await api.get(`/customer-recipients/logged`, configApi());
      const result = data.result.data;

      // Patologia para personalizar os insights
      if (result.patrology) setPatologia(result.patrology);

      const isRefresh = isTokenExpiringSoon();
      if (!isRefresh) {
        const refreshToken = localStorage.getItem("refreshToken");
        const { data: rd } = await api.post(`/auth/refresh-token/app`, {}, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
            "Content-Type": "application/json",
          },
        });
        localStorage.setItem("token",        rd.data.token);
        localStorage.setItem("refreshToken", rd.data.refreshToken);
        localStorage.setItem("expires",      rd.data.expires);
      }
      if (result.telemedicine?.date) setNextTelemedicine(result.telemedicine);
    } catch (error) {
      resolveResponse(error);
    }
  };

  useEffect(() => {
    const initial = async () => {
      setIsLoading(true);
      await getAll(periodo);
      await getLogged();
      setIsLoading(false);
    };
    initial();
  }, [isCheckIn, periodo]);

  // ── Dados de insight calculados ───────────────────────────────────────────

  const hasData = metric.ipv > 0;
  const ipvInfo = getIpvInsight(metric.ipv);
  const igsInfo = getIgsInsight(metric.igs, patologia);
  const ignInfo = getIgnInsight(metric.ign, patologia);
  const iesInfo = getIesInsight(dass9);

  const igsColors = getScoreColors(metric.igs);
  const ignColors = getScoreColors(metric.ign);
  const iesColors = getScoreColors(metric.ies);

  const dassTotalScore =
    (dass9.depression || 0) + (dass9.anxiety || 0) + (dass9.stress || 0);

  const insightBlocks: InsightBlock[] = hasData
    ? [
        {
          icon:    <FaRegMoon size={16} />,
          title:   `Sono — IGS ${metric.igs}`,
          color:   igsColors.text,
          bg:      igsColors.bg,
          border:  igsColors.border,
          insight: igsInfo.insight,
          dose:    igsInfo.dose,
        },
        {
          icon:    <IoIosNutrition size={16} />,
          title:   `Nutrição — IGN ${metric.ign}`,
          color:   ignColors.text,
          bg:      ignColors.bg,
          border:  ignColors.border,
          insight: ignInfo.insight,
          dose:    ignInfo.dose,
        },
        {
          icon:    <LuBrain size={16} />,
          title:   `Saúde Mental — IES ${metric.ies} (DASS-9: ${dassTotalScore})`,
          color:   iesColors.text,
          bg:      iesColors.bg,
          border:  iesColors.border,
          insight: iesInfo.insight,
          dose:    iesInfo.dose,
        },
      ]
    : [];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`${montserrat.className}`}>
      {modal ? (
        <VitalModal />
      ) : (
        <div className="max-h-[calc(100dvh-13rem)] overflow-y-auto px-1">

          {/* Alertas urgentes */}
          {!isCheckIn && !nextTelemedicine.date && metric.ies <= 60 && (
            <div className="mb-4 w-full p-3 bg-red-50 border border-red-200 rounded-2xl flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <FiAlertTriangle className="text-red-400" size={20} />
                <span className="text-red-400 font-bold text-sm">Precisando de apoio?</span>
              </div>
              <a
                href="tel:188"
                className="w-full py-3 bg-red-600 rounded-2xl flex items-center justify-center gap-3 text-white font-bold"
              >
                <FiPhone size={20} /> Ligar 188 - CVV (24h)
              </a>
            </div>
          )}

          {/* Check-in */}
          {isCheckIn && (
            <div
              onClick={() => setModal(true)}
              className="w-full bg-white p-5 rounded-2xl border border-gray-200 mb-4 flex flex-col gap-2 cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-2-500 rounded-xl">
                  <HiOutlineLightBulb className="text-brand-2-100" size={24} />
                </div>
                <div>
                  <h3 className="text-brand-2-500 font-bold text-lg leading-tight">
                    Registre seu dia
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Faça seu check-in diário para acompanhar sua evolução.
                  </p>
                </div>
              </div>
              <div className="bg-brand-2-500 mt-2 w-full py-2 rounded-2xl flex items-center justify-center border shadow-sm text-brand-2-100 font-bold text-sm">
                Fazer Check-in
              </div>
            </div>
          )}

          {/* Próxima consulta */}
          {nextTelemedicine.date && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 mb-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <FaVideo className="text-brand-500" size={18} />
                <span className="text-brand-500 font-bold text-sm">
                  Próxima consulta — {maskDate(nextTelemedicine.date)}
                </span>
              </div>
              <span className="text-brand-500 text-sm">
                ⏰ {nextTelemedicine.from} até {nextTelemedicine.to}
              </span>
              <span className="text-brand-500 text-sm">
                🩺 {nextTelemedicine.specialty}
              </span>
              <span className="text-brand-500 text-sm">
                👤 {nextTelemedicine.professional}
              </span>
              <div className="bg-brand-500 mt-1 w-full py-2 rounded-2xl flex items-center justify-center border shadow-sm">
                <Link href={nextTelemedicine.beneficiaryUrl}>
                  <span className="text-brand-100 font-bold text-sm">
                    Acessar consulta
                  </span>
                </Link>
              </div>
            </div>
          )}

          {/* Seletor de período */}
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-4 gap-1">
            {["Semana", "Mes", "Ano", "Personalizado"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`flex-1 py-2 px-1 text-xs font-bold rounded-xl transition-all ${
                  periodo === p
                    ? "bg-white text-brand-500 shadow-sm"
                    : "text-gray-400"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {periodo === "Personalizado" && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-1">
                <Label label="Data Inicial" required={false} />
                <Input
                  type="date"
                  onInput={(e: any) => setStartDate(e.target.value)}
                />
              </div>
              <div className="col-span-1">
                <Label label="Data Final" required={false} />
                <Input
                  type="date"
                  onInput={(e: any) => setEndDate(e.target.value)}
                />
              </div>
              <Button
                onClick={() => getAll(`${startDate}&${endDate}`)}
                type="button"
                variant="secondary"
                className="col-span-2"
                size="sm"
              >
                Buscar
              </Button>
            </div>
          )}

          {/* ── IPV Card com insight geral ─────────────────────────────── */}
          {hasData && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 mb-4">
              <div className="relative h-44 w-44 mx-auto mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={55}
                      outerRadius={75}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                    >
                      <Cell fill="#e2e8f0" stroke="none" />
                      <Cell fill={getBarColor(metric.ipv)} stroke="none" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    style={{ color: getBarColor(metric.ipv) }}
                    className="text-4xl font-bold"
                  >
                    {metric.ipv}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    IPV
                  </span>
                </div>
              </div>

              {/* Insight IPV */}
              <p className="text-center text-sm font-semibold text-gray-700 mb-1">
                {ipvInfo.insight}
              </p>
              <div className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 mb-3">
                <p className="text-xs font-semibold text-gray-500 text-center">
                  💊 {ipvInfo.dose}
                </p>
              </div>

              {/* Sub-scores */}
              <div className="flex justify-center gap-4">
                {[
                  { label: "IGS", value: metric.igs },
                  { label: "IGN", value: metric.ign },
                  { label: "IES", value: metric.ies },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="text-center bg-gray-100 py-2 px-4 rounded-xl"
                  >
                    <p className={`text-[10px] font-bold ${getColorMetric(value)}`}>
                      {label}
                    </p>
                    <p className={`text-xl font-bold ${getColorMetric(value)}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Insights & Doses de Saúde por Pilar ───────────────────── */}
          {hasData && (
            <div className="mb-4">
              <h3 className="font-bold text-brand-500 mb-3 text-sm uppercase tracking-wide">
                📋 Insights & Doses de Saúde
              </h3>
              <div className="flex flex-col gap-3">
                {insightBlocks.map((block, i) => (
                  <InsightCard key={i} block={block} />
                ))}
              </div>
            </div>
          )}

          {/* ── DASS-9 scores ─────────────────────────────────────────── */}
          {hasData && (
            <ul className="bg-white p-5 rounded-2xl border border-gray-200 mb-4 grid grid-cols-1 gap-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                DASS-9 — Saúde Emocional
              </p>
              {[
                { label: "Depressão", value: dass9.depression },
                { label: "Ansiedade", value: dass9.anxiety },
                { label: "Estresse",  value: dass9.stress },
              ].map(({ label, value }) => (
                <li
                  key={label}
                  className={`${getColorDass9(value)} rounded-2xl p-3 flex justify-between items-center`}
                >
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="text-sm font-bold">{value}</span>
                </li>
              ))}
              <li className="bg-gray-100 rounded-2xl p-3 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600">Total DASS-9</span>
                <span className="text-sm font-bold text-gray-700">{dassTotalScore} / 27</span>
              </li>
            </ul>
          )}

          {/* ── Gráfico de evolução ───────────────────────────────────── */}
          {hasData && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-brand-500 text-sm">Evolução IPV</h3>
                <div className="flex gap-2 text-[10px] font-medium text-gray-500">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400" /> &gt;85
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-400" /> 60-85
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400" /> &lt;60
                  </span>
                </div>
              </div>

              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    key={periodo}
                    data={metricWeek}
                    margin={{ top: 10, bottom: 10 }}
                  >
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      interval={periodo === "Semana" ? 0 : "preserveStartEnd"}
                      tickFormatter={(val) => {
                        if (periodo === "Semana") return val;
                        if (periodo === "Mes")
                          return val.includes("/") ? val.split("/")[0] : val;
                        if (periodo === "Ano") return val.substring(0, 3);
                        return val;
                      }}
                    />
                    <YAxis hide domain={[0, 100]} />
                    <Bar
                      dataKey="ipv"
                      radius={[10, 10, 10, 10]}
                      barSize={
                        periodo === "Semana"
                          ? 40
                          : periodo === "Mes"
                          ? 12
                          : periodo === "Ano"
                          ? 8
                          : 4
                      }
                    >
                      {metricWeek.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={GetBarColor(entry.ipv)}
                        />
                      ))}

                      {periodo === "Semana" && (
                        <LabelList
                          dataKey="ipv"
                          content={(props: any) => {
                            const { x, y, width, height, index } = props;
                            const data = metricWeek[index!];
                            if (!height || Number(height) < 60) return null;
                            const centerX = Number(x) + Number(width) / 2;
                            const startY  = Number(y) + 20;
                            return (
                              <g>
                                <text
                                  x={centerX}
                                  y={startY}
                                  fill="#fff"
                                  fontSize="10"
                                  fontWeight="bold"
                                  textAnchor="middle"
                                >
                                  {data.ipv.toFixed(0)}%
                                </text>
                                <line
                                  x1={Number(x) + 5}
                                  y1={startY + 5}
                                  x2={Number(x) + Number(width) - 5}
                                  y2={startY + 5}
                                  stroke="rgba(255,255,255,0.3)"
                                />
                                <text x={centerX} y={startY + 15} fill="#fff" fontSize="8" textAnchor="middle">
                                  S:{data.igs.toFixed(0)}
                                </text>
                                <text x={centerX} y={startY + 25} fill="#fff" fontSize="8" textAnchor="middle">
                                  N:{data.ign.toFixed(0)}
                                </text>
                                <text x={centerX} y={startY + 35} fill="#fff" fontSize="8" textAnchor="middle">
                                  M:{data.ies.toFixed(0)}
                                </text>
                              </g>
                            );
                          }}
                        />
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}