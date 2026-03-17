import { CheckInISO } from "@/components/pages/check-in-iso/CheckInISO";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pasbem | Check-In ISO",
    description: "This is Next.js Home for TailAdmin Bem Vital Template",
};

export default function CheckInISOPage() {
    return (
        <div className="min-h-[calc(100dvh-13rem)] max-h-[calc(100dvh-13rem)] overflow-y-auto">
            <CheckInISO />
        </div>
    );
}