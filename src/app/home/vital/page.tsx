import Vital from "@/components/pages/vital/Vital";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pasbem | Bem Vital",
    description: "This is Next.js Home for TailAdmin Bem Vital Template",
};

export default function Profile() {
    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 space-y-6 xl:col-span-7 h-[80dvh]">
                <Vital />
            </div>
        </div>
    );
}