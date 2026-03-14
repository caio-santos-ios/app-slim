import { Insights } from "@/components/pages/insights/Insights";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pasbem | Insights",
    description: "This is Next.js Home for TailAdmin Bem Vital Template",
};

export default function InsightsPage() {
    return (
        <div className="min-h-[calc(100dvh-13rem)] max-h-[calc(100dvh-13rem)] overflow-y-auto">
            <Insights />
        </div>
    );
}