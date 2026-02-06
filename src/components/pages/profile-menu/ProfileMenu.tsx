"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api, uriBase } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { TProfile } from "@/types/profile/profile.type";
import Button from "@/ui/Button";

export const ProfileMenu = () => {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const router = useRouter();
    const { reset, watch } = useForm<TProfile>();

    useEffect(() => {
        const localPhoto = localStorage.getItem("photo");
        if (localPhoto) setImagePreview(`${uriBase}/${localPhoto}`);
        getLogged();
    }, []);

    const getLogged = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get(`/customer-recipients/logged`, configApi());
            const result = data.result.data;
            reset(result);
            if (result.photo) setImagePreview(`${uriBase}/${result.photo}`);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const formBody = new FormData();
        formBody.append('photo', file);

        try {
            const { status, data } = await api.put(`/customer-recipients/profile-photo`, formBody, configApi(false));
            if (status === 200) {
                const newUrl = data.result.data.photo;
                setImagePreview(`${uriBase}/${newUrl}`);
                localStorage.setItem("photo", newUrl);
                resolveResponse({ status, message: "Foto atualizada!" });
            }
        } catch (error) {
            resolveResponse(error);
        }
    };

    return (
        <div className="p-4">
            <div className="flex flex-col items-center gap-4">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border">
                    {imagePreview ? (
                        <img src={imagePreview} className="h-full w-full object-cover" alt="Perfil" />
                    ) : (
                        <FaUserCircle className="text-gray-300 h-full w-full" />
                    )}
                </div>
                <label className="cursor-pointer bg-yellow-400 p-2 rounded-full">
                    <input type="file" hidden onChange={handleImageChange} />
                    <HiOutlinePencilSquare size={20} />
                </label>
            </div>
            <Button onClick={() => { localStorage.clear(); router.push("/"); }} className="w-full mt-4">Sair</Button>
        </div>
    );
};