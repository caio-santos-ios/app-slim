import { QuizDass21 } from "@/components/pages/dass21/Dass21";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pasbem | Bem Vital",
    description: "This is Next.js Home for TailAdmin Bem Vital Template",
};

export default function Dass() {
    return (
        <div className="min-h-[calc(100dvh-13rem)] max-h-[calc(100dvh-13rem)] overflow-y-auto">
            <QuizDass21 />
        </div>
    );
}