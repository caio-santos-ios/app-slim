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
            const {data} = await api.get(`/forwardings/atendimento`, configApi());
            const result = data.result.data;
            setLink(result.link);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const initial = async () => {
            await getLogged();
        }
        initial();
    }, [])
    
    return (
        <div>
            {link &&
                <div>
                    <a 
                        href={link} 
                        rel="noopener noreferrer"
                        style={{ color: '#007bff', textDecoration: 'underline' }}
                    >
                        Entrar na fila de atendimento
                    </a>
                </div>
            }
        </div>
    )
}