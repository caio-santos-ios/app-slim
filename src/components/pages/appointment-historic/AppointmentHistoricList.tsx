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
import { MdOutlineCancel } from "react-icons/md";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";

export const AppointmentHistoricList = () => {
    const [__, setIsLoading] = useAtom(loadingAtom);
    const [modalCreate, setModalCreate] = useState<boolean>(false);
    const [modalCanceled, setModalCanceled] = useState<boolean>(false);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [specialtyAvailabilities, setSpecialtyAvailabilities] = useState<any[]>([]);
    const [selectedDay, setSelectedDay] = useState<Date | undefined>();
    
    const diasComHorario = specialtyAvailabilities.map(h => {
        const [dia, mes, ano] = h.date.split("/");
        return new Date(Number(ano), Number(mes) - 1, Number(dia));
    });
    
    const { reset, register, setValue, watch, handleSubmit } = useForm<TAppointment>();
    const { reset: resetCancel, register: registerCancel, watch: watchCancel, handleSubmit: handleSubmitCancel } = useForm<TAppointment>();

    const save: SubmitHandler<TAppointment> = async (body: TAppointment) => {
        try {
            setIsLoading(true);
            const {data} = await api.post(`/appointments`, body, configApi());
            const result = data.result;  
            console.log(body)
            resolveResponse({status: 200, ...result});
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const cancel: SubmitHandler<TAppointment> = async (body: TAppointment) => {
        try {
            setIsLoading(true);
            const {data} = await api.put(`/appointments/cancel`, body, configApi());
            const result = data.result;  
            resolveResponse({status: 200, ...result});
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getAll = async (rapidocId: string) => {
        try {
            setIsLoading(true);
            const {data} = await api.get(`/telemedicine-historics?deleted=false&recipientId=${rapidocId}`, configApi());
            const result = data.result.data;
            setAppointments(result);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const normalizeStatus = (status: string) => {
        switch(status) {
            case "SCHEDULED": return "Agendado";
            case "CANCELED": return "Cancelado";
            default: return status;
        }
    };

    const normalizeNameStatus = (status: string) => {
        switch(status) {
            case "SCHEDULED": return "text-blue-500";
            case "CANCELED": return "text-red-500";
            default: return status;
        }
    };

    useEffect(() => {
        const initial = async () => {
            const rapidocId = localStorage.getItem("rapidocId");
            await getAll(rapidocId ? rapidocId : "");
        }
        initial();
    }, [])
    
    return (
        <ul className={`max-h-[calc(80dvh-.5rem)] overflow-y-auto flex flex-col gap-4`}>
            {
                appointments.map((ap: any) => {
                    return (
                        <li key={ap.id} className="grid grid-cols-6 rounded-2xl border border-brand-200 bg-white p-3 dark:border-gray-800 dark:bg-white/3 md:p-6">
                            <div className="col-span-4">
                                <p className="text-sm font-medium text-brand-900 dark:text-gray-500">DATA: <strong className="font-bold">{ap.date}</strong></p>
                                <p className="text-sm font-medium text-brand-900 dark:text-gray-500">HORARIO: <strong className="font-bold">{ap.time}</strong></p>
                                <p className="text-sm font-medium text-brand-900 dark:text-gray-500">STATUS: <strong className={`font-bold ${normalizeNameStatus(ap.status)}`}>{normalizeStatus(ap.status)}</strong></p>
                                <p className="text-sm font-medium text-brand-900 dark:text-gray-500">ESPECIALIDADE: <strong className="font-bold">{ap.specialistName}</strong></p>
                            </div>                            
                        </li>
                    )
                })
            }
        </ul>
    )
}