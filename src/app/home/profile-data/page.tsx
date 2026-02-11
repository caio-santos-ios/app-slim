import { ProfileForm } from "@/components/pages/profile/ProfileForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pasbem | Perfil",
    description: "This is Next.js Home for TailAdmin Perfil Template",
};

export default function ProfileData() {
    return (
        <div className="min-h-[calc(100dvh-13rem)] max-h-[calc(100dvh-13rem)] overflow-y-auto">
            <ProfileForm />
        </div>
    );
}