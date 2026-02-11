import { ForwardingHistoricList } from "@/components/pages/forwarding-historic/ForwardingHistoricList";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pasbem | Encaminhamentos",
    description: "This is Next.js Home for TailAdmin Encaminhamentos Template",
};

export default function ForwardingsHistoric() {
    return (
        <div className="min-h-[calc(100dvh-13rem)] max-h-[calc(100dvh-13rem)] overflow-y-auto">
            <h1 className="mb-1.5 block text-md font-bold text-brand-400">Historico Encaminhamentos</h1>
            <ForwardingHistoricList />
        </div>
    );
}