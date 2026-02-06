"use client";

import { profileAtom } from "@/jotai/profile/profile.jotai";
import { uriBase } from "@/service/api.service";
import { useAtom } from "jotai";
import { useEffect } from "react";

export const Header = () => {
    const [photo, setPhoto] = useAtom(profileAtom);
    
    useEffect(() => {
        const localPhoto = localStorage.getItem("photo");

        if(localPhoto) {
            setPhoto(localPhoto);
        }
    }, []);

    return (
        <header className="px-4 h-24 gradient-box flex justify-between items-center">
            <div className="h-auto">
                <img
                    className="h-20"
                    src="/aplicativo/logo-light.png"
                    alt="Logo"
                />
            </div> 
            
            <div className="h-20 w-20">
                {
                    photo ?
                    <img
                        className="h-full w-full object-cover rounded-full"
                        src={`${uriBase}/${photo}`}
                        alt="foto de perfil"
                    />
                    :
                    <>
                    </>
                }
            </div> 
        </header>
    )
}