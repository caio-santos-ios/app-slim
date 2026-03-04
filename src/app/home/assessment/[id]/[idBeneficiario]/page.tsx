import Assessment from "@/components/pages/assessment/Assessment";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pasbem | Avaliar Consulta",
};

export default function AvaliacaoPage({ params }: { params: { idConsult: string; beneficiario: string } }) {
    return (
        <div className="min-h-[calc(100dvh-13rem)] max-h-[calc(100dvh-13rem)] overflow-y-auto">
        <Assessment
            idConsult={params.idConsult}
            beneficiario={decodeURIComponent(params.beneficiario)}
        />
        </div>
    );
}