import { ForwardingHistoricList } from "@/components/pages/forwarding-historic/ForwardingHistoricList";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pasbem | Encaminhamentos",
    description: "This is Next.js Home for TailAdmin Encaminhamentos Template",
};

export default function ForwardingsHistoric() {
    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 space-y-6 xl:col-span-7 h-[85dvh]">
                <h1 className="mb-1.5 block text-md font-bold text-brand-400">Historico Encaminhamentos</h1>
                <ForwardingHistoricList />
            </div>
        </div>
    );
}