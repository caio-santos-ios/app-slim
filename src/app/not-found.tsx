import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/logo/Logo";
import { montserrat } from "@/components/pages/dass21/Dass21";
import Button from "@/ui/Button";

export const metadata: Metadata = {
  title: "Pasbem | Página não encontrada",
};

export default function NotFound() {
  return (
    <div className={`${montserrat.className} flex flex-col items-center justify-center min-h-dvh bg-gray-100 px-6`}>
        <div
        className="w-full max-w-sm bg-white rounded-3xl p-8 flex flex-col items-center text-center"
        style={{ boxShadow: "0 4px 24px rgba(26,58,92,0.10)" }}>
            <Logo className="h-30" />
            <h1 className="text-5xl font-extrabold text-brand-500 mb-1">404</h1>
            <p className="text-sm font-semibold text-brand-2-400 uppercase tracking-widest mb-4">
                Página não encontrada
            </p>

            <p className="text-sm text-brand-300 leading-relaxed mb-8">
                O endereço que você acessou não existe ou foi removido.
            </p>

            <Link href="/home" className="w-full">
                <button className="w-full py-3 rounded-2xl bg-brand-500 text-white font-bold text-sm">
                    Voltar para o início
                </button>
            </Link>
        </div>
    </div>
  );
}