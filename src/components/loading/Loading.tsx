"use client";

import "./style.css";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { useAtom } from "jotai";
import { montserrat } from "../pages/dass21/Dass21";

export const Loading = () => {
    const [loading] = useAtom(loadingAtom);
    
    return (
        loading &&
        <div className={`${montserrat.className} loading-overlay`}>
            <div className="container-loader">
                <div className="loader"></div>
                <p className="title-loader">Carregando...</p>
            </div>
        </div>
    )
}