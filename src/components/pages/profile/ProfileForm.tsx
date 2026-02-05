"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FaUserCircle, FaBalanceScale } from "react-icons/fa";
import { CiRuler } from "react-icons/ci";
import { FiLogOut, FiTarget } from "react-icons/fi";
import { MdOutlineWaterDrop } from "react-icons/md";
import { HiOutlinePencilSquare } from "react-icons/hi2";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { profileAtom } from "@/jotai/profile/profile.jotai";
import { api, uriBase } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { TProfile } from "@/types/profile/profile.type";
import Button from "@/ui/Button";

export const ProfileMenu = () => {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [photo, setPhoto] = useAtom(profileAtom);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const router = useRouter();
    const { reset, watch, setValue } = useForm<TProfile>();

    // 1. Carregamento inicial SEGURO (apenas no cliente)
    useEffect(() => {
        if (typeof window !== "undefined") {
            const localPhoto = localStorage.getItem("photo");
            if (localPhoto && localPhoto !== "undefined") {
                setImagePreview(`${uriBase}/${localPhoto}`);
            }
            getLogged();
        }
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

    // 2. Função de imagem SEM quebrar o servidor
    const handleImageChange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview imediato
        setImagePreview(URL.createObjectURL(file));

        // Importação DINÂMICA do conversor apenas quando o usuário clica
        // Isso impede o erro de build no Docker
        if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
            const heic2any = (await import("heic2any")).default; 
            const blob: any = await heic2any({
                blob: file,
                toType: "image/jpeg",
                quality: 0.7
            });
            const convertedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: "image/jpeg" });
            uploadPhoto(convertedFile);
        } else {
            uploadPhoto(file);
        }
    };

    const uploadPhoto = async (file: File) => {
        try {
            const formBody = new FormData();
            formBody.append('photo', file);

            const { status, data } = await api.put(
                `/customer-recipients/profile-photo`,
                formBody,
                {
                    ...configApi(false),
                    headers: { ...configApi(false).headers, 'Content-Type': 'multipart/form-data' }
                }
            );

            if (status === 200 && data?.result?.data) {
                const newUrl = data.result.data.photo;
                setPhoto(newUrl);
                setImagePreview(`${uriBase}/${newUrl}`);
                localStorage.setItem("photo", newUrl);
                resolveResponse({ status, message: "Foto atualizada!" });
            }
        } catch (error) {
            resolveResponse(error);
        }
    };

    const logout = () => {
        localStorage.clear();
        router.push("/");
    };

    // Funções de cálculo (Mantenha as suas originais aqui...)
    const calcularIMC = (p: number, a: number) => (a > 0 ? (p / (a * a)).toFixed(2) : 0);
    const calcularMeta = (p: number) => (p > 0 ? `${(p * 35 / 1000).toFixed(1)} L` : "0.0 L");

    return (
        <div className="p-4">
            <h1 className="text-md font-bold mb-4">Meu Perfil</h1>
            
            <div className="bg-white p-4 rounded-2xl border flex justify-between items-center mb-4">
                <div className="relative">
                    <div className="h-20 w-20 rounded-full overflow-hidden border bg-gray-50 flex items-center justify-center">
                        {imagePreview ? (
                            <img src={imagePreview} className="h-full w-full object-cover" alt="Perfil" />
                        ) : (
                            <FaUserCircle className="text-gray-300" size={60} />
                        )}
                    </div>
                    <label htmlFor="photo" className="absolute bottom-0 right-0 bg-white shadow-md p-1 rounded-full cursor-pointer">
                        <input onChange={handleImageChange} id="photo" type="file" accept="image/*" hidden />
                        <HiOutlinePencilSquare className="text-green-500" size={18} />
                    </label>
                </div>

                <div className="text-right">
                    <p className="font-bold">{watch("name")}</p>
                    <p className="text-xs text-gray-500">{watch("cpf")}</p>
                </div>
            </div>

            {/* Restante do seu layout de IMC e Água... */}
            <Button onClick={logout} variant="secondary" className="w-full mt-4">Sair</Button>
        </div>
    );
};