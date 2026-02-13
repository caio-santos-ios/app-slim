import { ForwardingList } from "@/components/pages/forwarding/ForwardingList";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pasbem | Encaminhamentos",
    description: "This is Next.js Home for TailAdmin Encaminhamentos Template",
};

export default function Appointment() {
    return (
        <div className="min-h-[calc(100dvh-13rem)] max-h-[calc(100dvh-13rem)] overflow-y-auto">
            <h1 className="mb-1.5 block text-md font-bold text-brand-400">Agendamentos</h1>
            <ForwardingList />
        </div>
    );
}