"use client";

import { useAtom } from "jotai";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";

export const Autorization = () => {
    const [_, setUserLogger] = useAtom(userLoggerAtom);
    const [__, setIsLoading] = useAtom(loadingAtom);
    const router = useRouter();
    const path = usePathname();


    useEffect(() => {
        const localToken = localStorage.getItem("appToken");
        const token = localToken ? localToken : "";
        if(!token) {
            setUserLogger(false);
            if(!["/reset-password", "/aplicativo/", "/", "/reset-password/", "reset-password"].includes(path)) {
                router.push("/aplicativo");
            };
        } else {
            setUserLogger(true);
            if(path == "/aplicativo" || path == "reset-password") {
                router.push("/aplicativo");
            };
        };

        setIsLoading(false);
    }, []);

    return <></>
}