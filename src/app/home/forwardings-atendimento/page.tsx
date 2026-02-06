import { ForwardingAten } from "@/components/pages/forwarding-atendimento/ForwardingAtendimento";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pasbem | Agendamentos",
    description: "This is Next.js Home for TailAdmin Agendamentos Template",
};

export default function AppointmentAtendimento() {
    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 space-y-6 xl:col-span-7 h-[80dvh]">
                <h1 className="mb-1.5 block text-md font-bold text-brand-400">Pronto Atendimento Digital</h1>
                <ForwardingAten />
            </div>
        </div>
    );
}