"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import Button from "@/ui/Button";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const ISO_QUESTIONS = [
  { id: "P1",  peso: 1, question: "Tenho clareza sobre as metas e o que é esperado do meu trabalho diariamente." },
  { id: "P2",  peso: 2, question: "Consigo organizar minhas tarefas de modo a realizar pausas e intervalos para refeições." },
  { id: "P3",  peso: 1, question: "As informações necessárias para realizar minhas atividades chegam de forma clara e no tempo certo." },
  { id: "P4",  peso: 1, question: "Tenho acesso às ferramentas e recursos necessários para cumprir minhas obrigações sem sobrecarga." },
  { id: "P5",  peso: 1, question: "O fluxo de trabalho no meu setor é planejado de forma a evitar urgências constantes." },
  { id: "P6",  peso: 1, question: "Recebo orientações e feedbacks que me ajudam a realizar minhas tarefas com segurança." },
  { id: "P7",  peso: 1, question: "As demandas profissionais são compatíveis com o meu horário de trabalho contratado." },
  { id: "P8",  peso: 1, question: "Existe um ambiente de colaboração mútua entre os colegas para a resolução de problemas." },
  { id: "P9",  peso: 1, question: "Sinto que as decisões e tratativas dentro do meu setor são conduzidas com imparcialidade." },
  { id: "P10", peso: 1, question: "Percebo que os esforços e bons resultados são valorizados pela gestão da empresa." },
  { id: "P11", peso: 3, question: "As normas de segurança e saúde são seguidas com rigor e prioridade no dia a dia." },
  { id: "P12", peso: 1, question: "Tenho previsibilidade sobre minhas atividades, o que me permite planejar minha rotina pessoal." },
] as const;

const OPTIONS = [
  { label: "Sempre",            score: 3 },
  { label: "Muitas Vezes",      score: 2 },
  { label: "Às Vezes",          score: 2 },
  { label: "Nunca / Raramente", score: 1 },
] as const;

type TQuestionId = (typeof ISO_QUESTIONS)[number]["id"];
type TAnsweredMap = Partial<Record<TQuestionId, { score: number; optionIdx: number; date: string }>>;

const todayStr = () => new Date().toISOString().split("T")[0];

function getTodayQuestion(answered: TAnsweredMap) {
  const today    = todayStr();
  const answered_ids = (Object.keys(answered) as TQuestionId[]).filter(
    (k) => answered[k]?.date === today
  );
  const remaining = ISO_QUESTIONS.filter((q) => !answered_ids.includes(q.id));
  if (remaining.length === 0) return null;
  const dayIndex = Math.floor(Date.now() / 86400000);
  return remaining[dayIndex % remaining.length];
}

export const CheckInISO = () => {
  const [_, setLoading] = useAtom(loadingAtom);
  const router          = useRouter();

  const [vitalId,      setVitalId]      = useState<string>("");
  const [answered,     setAnswered]     = useState<TAnsweredMap>({});
  const [question,     setQuestion]     = useState<(typeof ISO_QUESTIONS)[number] | null>(null);
  const [selectedIdx,  setSelectedIdx]  = useState<number | null>(null);
  const [alreadyDone,  setAlreadyDone]  = useState(false);

  const STORAGE_KEY = "iso_checkin";

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/vitals/beneficiary`, configApi());
        const result   = data.result.data;
        if (result?.id) setVitalId(result.id);
        if (result?.chekinISO) setAlreadyDone(true);
      } catch (error) {
        resolveResponse(error);
      } finally {
        setLoading(false);
      }
    };

    const raw: TAnsweredMap = (() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
    })();

    setAnswered(raw);
    setQuestion(getTodayQuestion(raw));
    init();
  }, []);

  const save = async () => {
    if (selectedIdx === null || !question) return;
    try {
      setLoading(true);

      const opt   = OPTIONS[selectedIdx];
      const score = opt.score;

      if (vitalId) {
        await api.put(`/vitals/iso`, {
          id:                   vitalId,
          chekinISO:            true,
          chekinISOPoint:       score,
          chekinISOQuestion:    question.question,
          chekinISOResponse:    opt.label
        }, configApi());
      } else {
        await api.post(`/vitals/iso`, {
          chekinISO:            true,
          chekinISOPoint:       score,
          chekinISOQuestion:    question.question,
          chekinISOResponse:    opt.label
        }, configApi());
      }

      resolveResponse({ status: 200, message: "Parabéns!" });

      const newAnswered: TAnsweredMap = {
        ...answered,
        [question.id]: { score, optionIdx: selectedIdx, date: todayStr() },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAnswered));
      setAnswered(newAnswered);
      setSelectedIdx(null);

      router.push("/home/");
    } catch (error) {
      resolveResponse(error);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white p-2 rounded-2xl border border-gray-200 h-[calc(100dvh-13rem)] overflow-y-auto">

      {(alreadyDone || !question) && (
        <div className="flex flex-col items-center justify-center h-80 gap-4 py-4 text-center">
          <div className="text-5xl">✅</div>
          <h2 className="text-brand-500 font-bold text-lg">ISO do dia concluído!</h2>
          <p className="text-gray-400 text-sm">
            Seu próximo checkin ISO estará disponível <span className="font-bold text-brand-500">amanhã</span>.
          </p>
        </div>
      )}

      {!alreadyDone && question && (
        <div className="flex flex-col gap-4 p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-500">
              {question.id}
            </span>
            {/* <span className="text-xs text-gray-400">Peso {question.peso}×</span> */}
          </div>

          <p className="text-sm font-medium text-gray-700 leading-relaxed">
            {question.question}
          </p>

          <div className="flex flex-col gap-2 mt-1">
            {OPTIONS.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all w-full border ${
                  selectedIdx === idx
                    ? "border-brand-500 bg-brand-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center border-2 transition-all ${
                    selectedIdx === idx ? "border-brand-500 bg-brand-500" : "border-gray-300"
                  }`}
                >
                  {selectedIdx === idx && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
                <span className="text-sm text-gray-700 flex-1">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 mt-4 px-2">
        {!alreadyDone && question ? (
          <Button
            type="button"
            className="flex-1"
            onClick={save}
            disabled={selectedIdx === null}
          >
            Salvar Check-in ISO
          </Button>
        ) : (
          <Link href="/home/" className="flex-1">
            <Button type="button" variant="primary" className="w-full">
              Voltar
            </Button>
          </Link>
        )}
      </div>

    </div>
  );
};