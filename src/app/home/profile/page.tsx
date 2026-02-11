import { ProfileMenu } from "@/components/pages/profile-menu/ProfileMenu";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pasbem | Perfil",
    description: "This is Next.js Home for TailAdmin Perfil Template",
};

export default function Profile() {
    return (
        <div className="min-h-[calc(100dvh-13rem)] max-h-[calc(100dvh-13rem)] overflow-y-auto">
            <ProfileMenu />
        </div>
    );
}