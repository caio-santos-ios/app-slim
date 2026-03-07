"use client";

import React, { useState, createContext, useContext } from "react";

type TAccordionCtx = {
    openIds: Set<string>;
    toggle: (id: string) => void;
};

const AccordionCtx = createContext<TAccordionCtx | null>(null);

export const Accordion = ({ children, multiple = false, defaultOpenId, className }: any) => {
    const [openIds, setOpenIds] = useState<Set<string>>(new Set(defaultOpenId ? [defaultOpenId] : []));

    const toggle = (id: string) => {
        setOpenIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else {
                if (!multiple) next.clear();
                next.add(id);
            }
            return next;
        });
    };

    return (
        <AccordionCtx.Provider value={{ openIds, toggle }}>
            {/* Removido o bg e border do pai para evitar o efeito de "card dentro de card" */}
            <div className={`flex flex-col gap-3 w-full ${className}`}>
                {children}
            </div>
        </AccordionCtx.Provider>
    );
};

export const AccordionItem = ({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) => {
    const ctx = useContext(AccordionCtx);
    const isOpen = ctx?.openIds.has(id);

    return (
        /* Estilização do Card Único */
        <div className={`rounded-2xl border transition-all duration-200 ${isOpen ? 'border-brand-500 bg-white shadow-sm' : 'border-brand-2-100 bg-brand-2-25'} ${className}`}>
            {React.Children.map(children, child => 
                React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, { id, isOpen }) : child
            )}
        </div>
    );
};

export const AccordionTrigger = ({ children, icon, subtitle, id, isOpen }: any) => {
    const ctx = useContext(AccordionCtx);

    return (
        <button
            type="button"
            onClick={() => ctx?.toggle(id)}
            className="w-full flex items-center gap-3 p-4 text-left outline-none"
        >
            {icon && (
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-brand-500 text-white' : 'bg-brand-2-100 text-brand-500'}`}>
                    {icon}
                </div>
            )}
            <div className="flex-1">
                <p className={`text-[15px] font-bold ${isOpen ? 'text-brand-500' : 'text-brand-500'}`}>{children}</p>
                {subtitle && <p className="text-xs text-gray-400 font-medium">{subtitle}</p>}
            </div>
            <svg
                className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-500' : 'text-gray-400'}`}
                fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
            >
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
    );
};

export const AccordionContent = ({ children, isOpen }: any) => {
    return (
        <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
                <div className="p-4 pt-0 border-t border-gray-100 mt-1">
                    {children}
                </div>
            </div>
        </div>
    );
};