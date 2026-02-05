import type { Metadata } from "next";
import dynamic from "next/dynamic";

// Isso força o componente a ser carregado APENAS no navegador
const ProfileMenu = dynamic(
  () => import("@/components/pages/profile-menu/ProfileMenu").then(mod => mod.ProfileMenu),
  { 
    ssr: false,
    loading: () => <div className="p-10 text-center font-montserrat">Carregando perfil...</div>
  }
);

export const metadata: Metadata = {
    title: "Pasbem | Perfil",
    description: "Perfil do usuário",
};

export default function Profile() {
    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 space-y-6 xl:col-span-7 h-[80dvh]">
                <ProfileMenu />
            </div>
        </div>
    );
}