"use client";

import { Autorization } from "@/components/autorization/Autorization";
import { Loading } from "@/components/loading/Loading";
import { AppTab } from "@/layout/AppTab";
import React from "react";
import { Bounce, ToastContainer } from "react-toastify";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 relative h-dvh">
      <Loading />
      <div className="p-4 mx-auto md:p-6">{children}</div>
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
