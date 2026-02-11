import Home from "@/components/pages/home/Home";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pasbem | Home",
  description: "This is Next.js Home for TailAdmin Home Template",
};

export default function Ecommerce() {
  return (
    <div className="min-h-[calc(100dvh-13rem)] max-h-[calc(100dvh-13rem)] overflow-y-auto">
      <Home />
    </div>
  );
}
