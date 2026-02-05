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
            reset(result)
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
        const file = e.target.files?.[0];
        
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };

            reader.readAsDataURL(file);

            await uploadPhoto(file); 
        }
    };
    
    const uploadPhoto = async (file?: File) => {
        const selectedFile = file || (document.querySelector('#photo') as HTMLInputElement)?.files?.[0];

        if (!selectedFile) {
            return resolveResponse({ status: 400, message: "Por favor, selecione uma imagem." });
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            return resolveResponse({ status: 400, message: "A imagem deve ter no máximo 5MB." });
        }

        try {
            const formBody = new FormData();
            formBody.append('photo', selectedFile);

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
                
            if (typeof window !== 'undefined') {
                localStorage.setItem("photo", newPhotoUrl);
            }

            resolveResponse({ status, message: "Foto atualizada com sucesso!" });
            
            if (setValue) setValue("image", "");
        }

    } catch (error: any) {
        console.error("Erro no upload:", error);
        // Tratamento de erro mais amigável
        const errorMsg = error.response?.data?.message || "Erro ao conectar com o servidor.";
        resolveResponse({ status: error.response?.status || 500, message: errorMsg });
    }
};

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("name");
        localStorage.removeItem("photo");
        localStorage.removeItem("rapidocId");
        localStorage.removeItem("tab");
        
        router.push("/");
    };

    useEffect(() => {
        const initial = async () => {
            const localPhoto = localStorage.getItem("photo");
            const localName = localStorage.getItem("name");
            // `${uriBase}/${photo}`
            if(localPhoto) setImagePreview(`${uriBase}/${localPhoto}`);
            if(localName) setName(localName);

            await getLogged();
        }
        initial();
    }, []);

    return (
        <div className={`${montserrat.className}`}>
            <h1 className="mb-1.5 block text-md font-bold text-gray-700 dark:text-gray-400">Meu Perfil</h1>

            <div className="bg-white p-3 rounded-2xl border border-gray-200 mb-3 flex justify-between gap-4">
                <div className="flex flex-col items-center">
                    {
                        imagePreview ?
                        <img
                            className="h-20 w-20 rounded-full border border-gray-200 mb-2"
                            src={imagePreview}
                            alt="foto de perfil"
                        />
                        :
                        <div className="h-24 w-20 rounded-full flex flex-col gap-2 justify-center items-center">
                            <FaUserCircle className="text-gray-400" size={70} />
                        </div>
                    }

                    <label htmlFor="photo" className="">
                        <input onChange={handleImageChange} id="photo" type="file" hidden />
                        <HiOutlinePencilSquare className="text-yellow-400" size={20} />
                    </label>
                </div>

                <div className="flex flex-col items-end justify-center text-brand-800">
                    <span className="text-sm font-semibold">{watch("name")}</span>
                    <span className="text-sm font-semibold">{watch("cpf")}</span>
                    <span className="text-sm font-semibold">{watch("phone")}</span>
                </div>
            </div> 

            <ul className="bg-white p-3 rounded-2xl border border-gray-200 mb-3 grid grid-cols-2 gap-4">
                <Link className="col-span-2" href="/home/profile-data">
                    <Button className="w-full" size="sm">Editar Dados</Button>
                </Link>
                <li className="bg-gray-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-brand-800">
                        <FaBalanceScale />
                        <span className="text-sm font-medium">Peso</span>
                    </div>
                    <span className="text-md font-semibold text-brand-800">{watch("weight")} Kg</span>
                </li>
                <li className="bg-gray-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-brand-800">
                        <CiRuler />
                        <span className="text-sm font-medium">Altura</span>
                    </div>
                    <span className="text-md font-semibold text-brand-800">{watch("height")} m</span>
                </li>
                <li className="bg-brand-2-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-brand-800">
                        <FiTarget />
                        <span className="text-sm font-medium">IMC</span>
                    </div>
                    <span className="text-md font-semibold text-brand-800">{calcularIMC(watch('weight'), watch('height'))}</span>
                </li>
                <li className="bg-gray-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-brand-800">
                        <MdOutlineWaterDrop />
                        <span className="text-sm font-medium">Meta Água</span>
                    </div>
                    <span className="text-md font-semibold text-brand-800">{calcularMetaAgua(watch("weight"))}</span>
                </li>
                
            </ul>
            
            <div className="col-span-2">
                <Button onClick={logout} type="button" variant="secondary" className="w-full" size="sm">
                    <FiLogOut /> 
                    Sair
                </Button>
            </div>
        </div>
    )
} 