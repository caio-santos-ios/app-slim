"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai"
import { profileAtom } from "@/jotai/profile/profile.jotai"
import { api, uriBase } from "@/service/api.service"
import { configApi, resolveResponse } from "@/service/config.service"
import { TProfile } from "@/types/profile/profile.type"
import Button from "@/ui/Button"
import { useAtom } from "jotai"
import Link from "next/link"
import { ChangeEvent, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { CiRuler } from "react-icons/ci"
import { FaBalanceScale, FaUserCircle } from "react-icons/fa"
import { FiLogOut, FiTarget } from "react-icons/fi"
import { MdOutlineWaterDrop } from "react-icons/md"
import { useRouter } from "next/navigation";
import { montserrat } from "../dass21/Dass21";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import heic2any from "heic2any";

export const ProfileMenu = () => {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [photo, setPhoto] = useAtom(profileAtom);
    const [name, setName] = useState<string>("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const router = useRouter();
    
    const { reset, register, watch, handleSubmit, setValue} = useForm<TProfile>();
    
    const getLogged = async () => {
        try {
            setIsLoading(true);
            const {data} = await api.get(`/customer-recipients/logged`, configApi());
            const result = data.result.data;  
            reset(result);
            
            // Atualiza o preview com a foto que veio do banco (se existir)
            if (result.photo) {
                setImagePreview(`${uriBase}/${result.photo}`);
            }
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const calcularIMC = (peso: number, altura: number) => {
        if (altura > 0) {
            const imc = peso / (altura * altura);
            return imc.toFixed(2); 
        }
        return 0;
    };

    const calcularMetaAgua = (peso: number) => {
        if (!peso || peso <= 0) return "0.0 L";
        const ml = peso * 35;
        const litros = ml / 1000;
        return `${litros.toFixed(1)} L`;
    };

    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        let file = files[0];

        // 1. Preview Local Imediato (Melhora UX no Android)
        const localUrl = URL.createObjectURL(file);
        setImagePreview(localUrl);

        try {
            // 2. Tratamento de HEIC (iPhone)
            if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
                const blob: any = await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 0.7
                });
                file = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: "image/jpeg" });
            }

            await uploadPhoto(file);
        } catch (err) {
            console.error("Erro ao processar imagem", err);
        }
    };
    
    const uploadPhoto = async (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            return resolveResponse({ status: 400, message: "A imagem deve ter no máximo 5MB." });
        }

        try {
            const formBody = new FormData();
            formBody.append('photo', file);

            const { status, data } = await api.put(
                `/customer-recipients/profile-photo`, 
                formBody, 
                {
                    ...configApi(false),
                    headers: {
                        ...configApi(false).headers,
                        'Content-Type': 'multipart/form-data', 
                    }
                }
            );

            if (status === 200 && data?.result?.data) {
                const newPhotoUrl = data.result.data.photo;
                setPhoto(newPhotoUrl);
                setImagePreview(`${uriBase}/${newPhotoUrl}`); // Atualiza para a URL final da API
                
                if (typeof window !== 'undefined') {
                    localStorage.setItem("photo", newPhotoUrl);
                }
                resolveResponse({ status, message: "Foto atualizada com sucesso!" });
            }
        } catch (error: any) {
            console.error("Erro no upload:", error);
            resolveResponse(error);
        }
    };

    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.clear();
            router.push("/");
        }
    };

    useEffect(() => {
        // Proteção para o Build do Next.js (SSR)
        if (typeof window !== 'undefined') {
            const localPhoto = localStorage.getItem("photo");
            const localName = localStorage.getItem("name");
            
            if (localPhoto && localPhoto !== "undefined") {
                setImagePreview(`${uriBase}/${localPhoto}`);
            }
            if (localName) setName(localName);

            getLogged();
        }
    }, []);

    return (
        <div className={`${montserrat.className}`}>
            <h1 className="mb-1.5 block text-md font-bold text-gray-700 dark:text-gray-400">Meu Perfil</h1>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 mb-3 flex justify-between items-center gap-4">
                <div className="relative h-20 w-20">
                    <div className="h-20 w-20 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-50">
                        {imagePreview ? (
                            <img
                                className="h-full w-full object-cover"
                                src={imagePreview}
                                alt="foto de perfil"
                            />
                        ) : (
                            <FaUserCircle className="text-gray-300" size={80} />
                        )}
                    </div>

                    <label 
                        htmlFor="photo" 
                        className="absolute -bottom-1 -right-1 bg-white shadow-md p-1.5 rounded-full cursor-pointer border border-gray-100"
                    >
                        <input onChange={handleImageChange} id="photo" type="file" accept="image/*" hidden />
                        <HiOutlinePencilSquare className="text-brand-400" size={18} />
                    </label>
                </div>

                <div className="flex flex-col items-end justify-center text-brand-800">
                    <span className="text-sm font-bold">{watch("name") || "Carregando..."}</span>
                    <span className="text-xs text-gray-500">{watch("cpf")}</span>
                    <span className="text-xs text-gray-500">{watch("phone")}</span>
                </div>
            </div> 

            <ul className="bg-white p-3 rounded-2xl border border-gray-200 mb-3 grid grid-cols-2 gap-4">
                <Link className="col-span-2" href="/home/profile-data">
                    <Button className="w-full !bg-(--color-brand-300)" size="sm">Editar Dados</Button>
                </Link>
                
                <li className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <FaBalanceScale size={14} />
                        <span className="text-xs font-medium">Peso</span>
                    </div>
                    <span className="text-md font-bold text-brand-800">{watch("weight") || 0} Kg</span>
                </li>

                <li className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <CiRuler size={16} />
                        <span className="text-xs font-medium">Altura</span>
                    </div>
                    <span className="text-md font-bold text-brand-800">{watch("height") || 0} m</span>
                </li>

                <li className="bg-green-50 rounded-2xl p-4 border border-green-100">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                        <FiTarget size={14} />
                        <span className="text-xs font-medium">IMC</span>
                    </div>
                    <span className="text-md font-bold text-green-700">{calcularIMC(watch('weight'), watch('height'))}</span>
                </li>

                <li className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <MdOutlineWaterDrop size={14} />
                        <span className="text-xs font-medium">Meta Água</span>
                    </div>
                    <span className="text-md font-bold text-blue-700">{calcularMetaAgua(watch("weight"))}</span>
                </li>
            </ul>
            
            <div className="col-span-2">
                <Button onClick={logout} type="button" variant="secondary" className="w-full gap-2" size="sm">
                    <FiLogOut /> 
                    Sair da Conta
                </Button>
            </div>
        </div>
    )
}