import { ForwardingList } from "@/components/pages/forwarding/ForwardingList";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pasbem | Encaminhamentos",
    description: "This is Next.js Home for TailAdmin Encaminhamentos Template",
};

export default function Appointment() {
    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 space-y-6 xl:col-span-7 h-[85dvh]">
                <h1 className="mb-1.5 block text-md font-bold text-brand-400">Encaminhamentos</h1>
                <ForwardingList />
            </div>
        </div>
    );
}