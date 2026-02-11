"use client";

import { Autorization } from "@/components/autorization/Autorization";
import { Loading } from "@/components/loading/Loading";
import { AppTab } from "@/layout/AppTab";
import { Header } from "@/layout/Header";
import React from "react";
import { Bounce, ToastContainer } from "react-toastify";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 relative h-dvh bg-gray-100">
      <Loading />
      <Header />
        <div className="px-4 mx-auto pt-2 h-[calc(100dvh-12rem)] overflow-y-auto">{children}</div>
        <Autorization />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          transition={Bounce}
        />
      <AppTab />
    </div>
  );
}
