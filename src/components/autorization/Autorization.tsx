"use client";

import { useAtom } from "jotai";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";

type TProp = {
    path?: string;
}

export const Autorization = () => {
    const [_, setUserLogger] = useAtom(userLoggerAtom);
    const [__, setIsLoading] = useAtom(loadingAtom);
    const router = useRouter();
    const path = usePathname();


    useEffect(() => {
        const localToken = localStorage.getItem("token");
        const token = localToken ? localToken : "";
        if(!token) {
            setUserLogger(false);
            if(!["/reset-password", "/aplicativo/", "/", "/reset-password/", "reset-password"].includes(path)) {
                router.push("/aplicativo");
            };
        } else {
            setUserLogger(true);
            if(path == "/" || path == "reset-password") {
                router.push("/home");
            };
        };

        setIsLoading(false);
    }, []);

    return <></>
}