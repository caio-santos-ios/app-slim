"use client";

import { profileAtom } from "@/jotai/profile/profile.jotai";
import { api, uriBase } from "@/service/api.service";
import { configApi } from "@/service/config.service";
import { maskDate } from "@/utils/mask.util";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IoNotificationsOutline } from "react-icons/io5";

interface Notification {
    title: string;
    description: string;
    sendDate: any;
    read: boolean;
}

export const Header = () => {
    const [photo, setPhoto] = useAtom(profileAtom);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter((n) => !n.read).length;

    useEffect(() => {
        const localPhoto = localStorage.getItem("appPhoto");
        if (localPhoto) setPhoto(localPhoto);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const today = new Date().toISOString().split('T')[0].split("-");
            const { data } = await api.get(`/notifications?lt$sendDate=${today[0]}-${today[1]}-${parseInt(today[2]) + 1}&type=NotificationApp&deleted=false&orderBy=sendDate&sort=desc`, configApi());
            const result = data.result.data;
            const list: any[] = [];
            result.forEach((x: any) => {
                if(x.origin == "Vital") {
                    if(`${today[0]}-${today[1]}-${today[2]}` == x.sendDate.split("T")[0]) {
                        list.push(x);
                    }
                } else {
                    list.push(x);
                }
            })
            setNotifications(list);
        } catch (error) {}
    };

    const readNotification = async (notification: any) => {
        if(notification.read) {
            return;
        } 

        try {
            await api.put(`/notifications/read/${notification.id}`, {}, configApi());
            await fetchNotifications();

            setTimeout(() => {
                if(!notification.read) {
                    if(notification.link) window.location.href = notification.link;
                };
            }, 1000);            
        } catch (error) {
            console.error("Erro ao ler notificação", error);
        }
    };

    const deleteNotification = async (notification: any) => {
        try {
            await api.delete(`/notifications/${notification.id}`, configApi());
            setNotifications(prev => prev.filter((n: any) => n.id !== notification.id));
        } catch (error) {
            console.error("Erro ao remover notificação", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <header className="px-4 h-24 gradient-box flex justify-between items-center">
            <div className="h-auto">
                <img className="h-20" src="/aplicativo/logo-light.png" alt="Logo" />
            </div>

            <div className="flex items-center gap-4">
                <div ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen((prev) => !prev)}
                        className="relative p-2 text-white"
                    >
                        <IoNotificationsOutline size={26} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {dropdownOpen && (
                        <div
                            className={`fixed left-1/2 -translate-x-1/2 top-20 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden
                                transition-all duration-300 ease-out
                                ${dropdownOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}
                        >
                            {/* Header dropdown */}
                            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-brand-500 font-montserrat">Notificações</span>
                                    {unreadCount > 0 && (
                                        <span className="bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Lista */}
                            <ul className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <li className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400">
                                        <IoNotificationsOutline size={32} className="text-gray-300" />
                                        <span className="text-sm">Nenhuma notificação</span>
                                    </li>
                                ) : (
                                    notifications.map((n: any, i) => (
                                        <li
                                            key={i}
                                            onClick={() => readNotification(n)}
                                            className={`relative px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                                                i < notifications.length - 1 ? 'border-b border-gray-100' : ''
                                            } ${!n.read ? 'bg-[#f0faf5]' : 'bg-white'}`}
                                        >
                                            <div className="flex items-start gap-3 pr-6">
                                                {/* Ícone da categoria */}
                                                <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
                                                    !n.read ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                    {n.title?.includes('Sono') ? '🌙' :
                                                    n.title?.includes('Nutrição') ? '🥗' :
                                                    n.title?.includes('Mental') ? '🧠' : '🔔'}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <p className={`text-sm truncate ${!n.read ? 'font-bold text-brand-500' : 'font-medium text-gray-600'}`}>
                                                            {n.title}
                                                        </p>
                                                        {!n.read && (
                                                            <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-brand-500" />
                                                        )}
                                                    </div>

                                                    {n.description && (
                                                        <p className="text-xs text-gray-400 mt-0.5 truncate">{n.description}</p>
                                                    )}

                                                    <p className="text-[10px] text-gray-300 mt-1">
                                                        {maskDate(n.sendDate, "seconds")}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Botão remover */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // chamar função de remover
                                                    deleteNotification(n);
                                                }}
                                                className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-colors group"
                                            >
                                                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                    <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                                        className="text-gray-400 group-hover:text-red-400"/>
                                                </svg>
                                            </button>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="h-20 w-20">
                    {photo && (
                        <img
                            className="h-full w-full object-cover rounded-full"
                            src={`${uriBase}/${photo}`}
                            alt="foto de perfil"
                        />
                    )}
                </div>
            </div>
        </header>
    );
};