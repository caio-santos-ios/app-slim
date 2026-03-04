import { CheckIn } from "@/components/pages/igs/IGS";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pasbem | Check-In",
    description: "This is Next.js Home for TailAdmin Bem Vital Template",
};

export default function CheckInPage() {
    return (
        <div className="min-h-[calc(100dvh-13rem)] max-h-[calc(100dvh-13rem)] overflow-y-auto">
            <CheckIn />
        </div>
    );
}