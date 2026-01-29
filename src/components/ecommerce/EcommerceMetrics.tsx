"use client";
import { useEffect, useState } from "react";

export const EcommerceMetrics = () => {
  const [name, setName] = useState<string>("");
  
  useEffect(() => {
    const nameLocal = localStorage.getItem("name");
    if(nameLocal) setName(nameLocal)
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
        <div className="flex items-end justify-between">
          <h1 className="text-lg font-bold text-brand-900 dark:text-gray-500">
            Bem vindo(a), <span className="text-brand-600 dark:text-gray-200">{name || 'Usuário'}</span>
          </h1>  
        </div>
      </div>
    </div>
  );
};
