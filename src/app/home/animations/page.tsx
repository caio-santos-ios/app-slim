import { Animation } from "@/components/pages/animations/Animation";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pasbem | Animações",
    description: "This is Next.js Home for TailAdmin Bem Vital Template",
};

export default function AnimationPage() {
    return (
        <div className="min-h-[calc(100dvh-13rem)] max-h-[calc(100dvh-13rem)] overflow-y-auto">
            <Animation />
        </div>
    );
}