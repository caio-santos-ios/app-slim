"use client";

import { CheckInManhaAnimation } from "@/components/animations/Animations"
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { useEffect } from "react";

export const Animation = () => {
    const [_, setLoading] = useAtom(loadingAtom);

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <div>
            <CheckInManhaAnimation onDone={() => {}} />
        </div>
    )
}