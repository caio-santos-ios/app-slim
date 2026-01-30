import Home from "@/components/pages/home/Home";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pasbem | Home",
  description: "This is Next.js Home for TailAdmin Home Template",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <Home />
      </div>
    </div>
  );
}
