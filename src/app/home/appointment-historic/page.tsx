import { AppointmentHistoricList } from "@/components/pages/appointment-historic/AppointmentHistoricList";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pasbem | Agendamentos",
    description: "This is Next.js Home for TailAdmin Agendamentos Template",
};

export default function AppointmentHistoric() {
    return (
        <div className="min-h-[calc(100dvh-13rem)] max-h-[calc(100dvh-13rem)] overflow-y-auto">
            <h1 className="mb-1.5 block text-md font-bold text-brand-400">Historico Agendamentos</h1>
            <AppointmentHistoricList />
        </div>
    );
}