"use client";

import Input from "@/components/form/input/Input";
import Label from "@/components/form/LabelForm";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { ResetAppointment, TAppointment } from "@/types/appointment/appointment.type";
import Button from "@/ui/Button";
import { useAtom } from "jotai";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { IoIosVideocam } from "react-icons/io";
import { MdOutlineCancel, MdOutlineCheck } from "react-icons/md";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";
import { toast } from "react-toastify";

export const ForwardingAten = () => {
    const [__, setIsLoading] = useAtom(loadingAtom);
    const [link, setLink] = useState<string>("");
    
    const getLogged = async () => {
        try {
            setIsLoading(true);
            const {data} = await api.get(`/customer-recipients/atendimento`, configApi());
            const result = data.result.data;
            
            if (result.link) {
                setLink(result.link);
                window.location.assign(result.link);
            } else {
                toast.info("Link de atendimento não disponível.");
            }
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div>
            <div className="mb-4 h-[80dvh] flex justify-center items-center">
                <Button onClick={() => getLogged()} type="button" className="w-full h-8" size="sm">Solicitar atendimento</Button>
            </div>
        </div>
    )
}