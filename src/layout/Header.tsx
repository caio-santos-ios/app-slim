"use client";

import { profileAtom } from "@/jotai/profile/profile.jotai";
import { uriBase } from "@/service/api.service";
import { useAtom } from "jotai";
import { useEffect } from "react";

export const Header = () => {
    const [photo, setPhoto] = useAtom(profileAtom);
    
    useEffect(() => {
        const localPhoto = localStorage.getItem("photo");
        console.log(localPhoto)
        if(localPhoto) {
            setPhoto(localPhoto);
        }
    }, []);

    useEffect(() => {
        if(photo) {
            console.log(photo)
        }
    }, [photo]);

    return (
        <header className="px-4 h-24 bg-brand-500 flex justify-between items-center">
            <div className="h-auto">
                <img
                    className="h-20"
                    src="/aplicativo/logo-light.png"
                    alt="Logo"
                />
            </div> 
            
            <div className="h-auto">
                {
                    photo ?
                    <img
                        className="h-20 w-20 rounded-full"
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