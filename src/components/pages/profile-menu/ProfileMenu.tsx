"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai"
import { profileAtom } from "@/jotai/profile/profile.jotai"
import { api } from "@/service/api.service"
import { configApi, resolveResponse } from "@/service/config.service"
import { TProfile } from "@/types/profile/profile.type"
import Button from "@/ui/Button"
import { useAtom } from "jotai"
import Link from "next/link"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { CiRuler } from "react-icons/ci"
import { FaBalanceScale } from "react-icons/fa"
import { FiLogOut, FiTarget } from "react-icons/fi"
import { MdOutlineWaterDrop } from "react-icons/md"
import { useRouter } from "next/navigation";

export const ProfileMenu = () => {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [__, setPhoto] = useAtom(profileAtom);
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

    const uploadPhoto = async () => {
        const attachment: any = document.querySelector('#image');

        if(attachment.files.length > 0) {
            try {
                const formBody = new FormData();
                if(attachment) {
                    if (attachment.files[0]) formBody.append('photo', attachment.files[0]);
                };

                const { status, data } = await api.put(`/customer-recipients/profile-photo`, formBody, configApi(false));
                const result = data.result.data;
                setPhoto(result.photo);
                localStorage.setItem("photo", result.photo);
                resolveResponse({status, message: "Foto atualizada com sucesso!"});
                setValue("image", "");
            } catch (error) {
                console.log(error)
                resolveResponse(error);
            }
        };
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
            await getLogged();
        }
        initial();
    }, []);

    return (
        <div>
            <h1 className="mb-1.5 block text-md font-bold text-gray-700 dark:text-gray-400">Meu Perfil</h1>

            <ul className="bg-white p-6 rounded-2xl border border-gray-200 mb-4 grid grid-cols-2 gap-4">
                <li className="bg-gray-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-gray-500">
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
                <Link className="col-span-2" href="/home/profile-data">
                    <Button className="w-full" size="sm">Editar Dados</Button>
                </Link>
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