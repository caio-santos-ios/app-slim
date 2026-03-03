import Ranking from "@/components/pages/ranking/Ranking";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pasbem | Ranking",
    description: "This is Next.js Home for TailAdmin Home Template",
};

export default function RankingPage() {
    return (
        <div className="min-h-[calc(100dvh-13rem)] max-h-[calc(100dvh-13rem)] overflow-y-auto">
            <Ranking />
        </div>
    );
}