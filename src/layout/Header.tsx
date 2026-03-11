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
    const router = useRouter();

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
            const { data } = await api.get(`/notifications?lt$sendDate=${today[0]}-${today[1]}-${parseInt(today[2]) + 1}&type=NotificationApp&orderBy=sendDate&sort=desc`, configApi());
            const result = data.result.data;
            setNotifications(result);
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

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <header className="px-4 h-24 gradient-box flex justify-between items-center">
            <div className="h-auto">
                <img className="h-20" src="/aplicativo/logo-light.png" alt="Logo" />
            </div>

            <div className="flex items-center gap-4">
                {/* Sino */}
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
                            className={`fixed left-1/2 -translate-x-1/2 top-20 w-80 bg-white rounded-2xl border border-gray-200 shadow-lg z-50 overflow-hidden
                                transition-all duration-300 ease-out
                                ${dropdownOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}
                        >
                            <div className="px-4 py-3 border-b">
                                <span className="font-semibold text-brand-500 font-montserrat">
                                    Notificações
                                </span>
                            </div>

                            <ul className="max-h-72 overflow-y-auto divide-y divide-brand-500">
                                {notifications.length === 0 ? (
                                    <li className="px-4 py-6 text-center text-sm text-gray-400">
                                        Nenhuma notificação
                                    </li>
                                ) : (
                                    notifications.map((n, i) => (
                                        <li
                                            onClick={() => readNotification(n)}
                                            key={i}
                                            className={`px-4 py-3 ${!n.read ? "bg-[#f0faf5]" : ""}`}
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <p className={`text-sm text-brand-500 ${!n.read ? "font-bold" : "font-semibold"}`}>
                                                        {n.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {n.description}
                                                    </p>
                                                </div>
                                                {!n.read && (
                                                    <span className="mt-1 h-2 w-2 rounded-full bg-brand-2-300 shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                {maskDate(n.sendDate, "seconds")}
                                            </p>

                                            
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Foto */}
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