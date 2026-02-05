"use client";

import { iconAtom } from "@/jotai/global/icons.jotai";
import { currentTabAtom } from "@/jotai/global/tab.jotai";
import { useAtom } from "jotai";
import Link from "next/link";
import { useEffect, useState } from "react";

type TSubmenu = {
    label: string;
    link: string;
}

type TTab = {
    typeIcon: string;
    icon: string;
    link: string;
    code: string;
    submenus?: TSubmenu[];
}

export const AppTab = () => {
    const [icons] = useAtom(iconAtom);
    const [currentTab, setCurrentTab] = useAtom(currentTabAtom);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [tabs] = useState<TTab[]>([
        {
            icon: 'GoHome',
            link: '/home',
            code: 'home',
            typeIcon: 'icon'
        },
        {
            icon: 'PiTreeBold',
            link: '/home/vital',
            code: 'vital',
            typeIcon: 'icon'
        },
        {
            icon: 'LuBrain',
            typeIcon: 'icon',
            link: '#',
            code: 'appointment',
            submenus: [
                { label: 'Agendamentos', link: '/home/appointment' },
                { label: 'DASS-21', link: '/home/dass' },
                { label: 'Histórico', link: '/home/appointment-historic' }
            ]
        },
        {
            icon: 'IoCalendarOutline',
            link: '#',
            code: 'forwarding',
            typeIcon: 'icon',
            submenus: [
                { label: 'Atendimento', link: '/home/forwardings-atendimento' },
                { label: 'Encaminhamentos', link: '/home/forwardings' },
                { label: 'Histórico', link: '/home/forwardings-historic' }
            ]
        },
        {
            icon: 'BsPerson',
            link: '/home/profile',
            code: 'profile',
            typeIcon: 'icon'
        },
    ]);

    const handleTabClick = (tab: TTab) => {
        localStorage.setItem("tab", tab.code);
        setCurrentTab(tab.code);

        if (tab.submenus) {
            setOpenDropdown(openDropdown === tab.code ? null : tab.code);
        } else {
            setOpenDropdown(null);
        }
    };

    useEffect(() => {
        const tabLocal = localStorage.getItem("tab");
        if(tabLocal) {
            setCurrentTab(tabLocal);
        }
    }, []);

    return (
        <div className="flex justify-center">
            <ul className="w-[90dvw] md:w-[60dvw] p-1 absolute bottom-8 rounded-4xl bg-brand-500 text-white flex justify-between items-center">
                {tabs.map((tab: TTab) => {
                    const IconComponent = tab.icon ? icons[tab.icon] : null;
                    const isActive = currentTab === tab.code;
                    const isDropdownOpen = openDropdown === tab.code;

                    return (
                        <li key={tab.code} className="relative flex flex-col items-center">
                            {tab.submenus && isDropdownOpen && (
                                <div className="absolute bottom-14 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl shadow-lg p-2 min-w-37.5 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2">
                                    {tab.submenus.map((sub) => (
                                        <Link 
                                            key={sub.link} 
                                            href={sub.link}
                                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm transition-colors"
                                            onClick={() => setOpenDropdown(null)}
                                        >
                                            {sub.label}
                                        </Link>
                                    ))}

                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-800 rotate-45" />
                                </div>
                            )}

                            <Link 
                                href={tab.submenus ? "#" : tab.link}
                                onClick={() => handleTabClick(tab)}
                                className={`${isActive ? 'bg-brand-300' : ''} w-12 h-12 rounded-full flex justify-center items-center transition-all`}>
                                {
                                    tab.typeIcon == "icon" ?
                                    IconComponent && <IconComponent size={25} />
                                    :
                                    <img
                                        className="h-full"
                                        src={`/aplicativo/${tab.icon}`}
                                        alt="Logo"
                                    />
                                }
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
}