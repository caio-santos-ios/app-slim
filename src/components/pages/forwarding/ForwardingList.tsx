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

export const ForwardingList = () => {
    const [__, setIsLoading] = useAtom(loadingAtom);
    const [modalCreate, setModalCreate] = useState<boolean>(false);
    const [modalCanceled, setModalCanceled] = useState<boolean>(false);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [specialties, setSpecialty] = useState<any[]>([]);
    const [specialtyAvailabilities, setSpecialtyAvailabilities] = useState<any[]>([]);
    const [selectedDay, setSelectedDay] = useState<Date | undefined>();
    
    const diasComHorario = specialtyAvailabilities.map(h => {
        const [dia, mes, ano] = h.date.split("/");
        return new Date(Number(ano), Number(mes) - 1, Number(dia));
    });
    
    const { reset, register, setValue, getValues, watch, handleSubmit } = useForm<TAppointment>();

    const save: SubmitHandler<TAppointment> = async (body: TAppointment) => {
        try {
            setIsLoading(true);
            const {data} = await api.post(`/forwardings`, body, configApi());
            const result = data.result;  
            resolveResponse({status: 200, ...result});
            setModalCreate(false);
            reset(ResetAppointment);
            setValue("date", "");
            setValue("time", "");
            setValue("availabilityUuid", "");
            setSelectedDay(undefined);
            const rapidocId = localStorage.getItem("rapidocId");
            await getAll(rapidocId ? rapidocId : "");
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getAll = async (rapidocId: string) => {
        try {
            setIsLoading(true);
            const {data} = await api.get(`/forwardings/${rapidocId}`, configApi());
            const result = data.result.data;
            setAppointments(result);

            const name = localStorage.getItem("name");
            setValue("recipientName", name ? name : "");
            setValue("beneficiaryUuid", rapidocId ? rapidocId : "");
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getSelectSpecialtyAvailability = async (specialtyUuid: string, beneficiaryUuid: string) => {
        try {
            setIsLoading(true);
            const {data} = await api.get(`/appointments/specialty-availability/${specialtyUuid}/${beneficiaryUuid}`, configApi());
            const result = data.result;
            setSpecialtyAvailabilities(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const normalizeStatus = (status: string) => {
        switch(status) {
            case "PENDING": return "Pedente";
            case "SCHEDULED": return "Agendado";
            case "CANCELED": return "Cancelado";
            default: return status;
        }
    };

    const normalizeNameStatus = (status: string) => {
        switch(status) {
            case "PENDING": return "text-yellow-500";
            case "SCHEDULED": return "text-blue-500";
            case "CANCELED": return "text-red-500";
            default: return status;
        }
    };

    useEffect(() => {
        if(selectedDay) {
            const existed = specialtyAvailabilities.find(h => h.date === selectedDay.toLocaleDateString('pt-BR'));
            if(!existed) toast.warn(`Nenhum horario disponível para o dia ${selectedDay.toLocaleDateString('pt-BR')}`, {theme: 'colored'});
        }
    }, [selectedDay]);

    useEffect(() => {
        const initial = async () => {
            const rapidocId = localStorage.getItem("rapidocId");
            await getAll(rapidocId ? rapidocId : "");
        }
        initial();
    }, [])
    
    return (
        <div>
            {
                modalCreate &&
                <form onSubmit={handleSubmit(save)} className="grid grid-cols-4 gap-4 max-h-[calc(80dvh-2rem)] overflow-y-auto">                
                    <div className="col-span-4">
                        <Label label="Especialista" required={false}/>
                        <Input disabled {...register("specialtyName")} placeholder="Especialista"/>
                    </div>
                    <div className="col-span-4 flex justify-center">
                        <DayPicker
                            mode="single"
                            selected={selectedDay}
                            onSelect={setSelectedDay}
                            locale={ptBR}
                            modifiers={{ 
                                available: diasComHorario,
                                unavailable: { before: new Date() }
                            }}
                            modifiersClassNames={{
                                available: "text-white font-bold bg-brand-600 rounded-full", 
                                unavailable: "text-red-500 line-through opacity-50" 
                            }}
                        />
                    </div>
                    <div className="col-span-4">
                        {selectedDay && (
                            <div className="col-span-4 grid grid-cols-2 gap-2">
                                <Label label="Selecione o Horário" className="col-span-2"/>
                                {specialtyAvailabilities
                                    .filter(h => h.date === selectedDay.toLocaleDateString('pt-BR'))
                                    .map(h => (
                                        <button
                                            key={h.id}
                                            type="button"
                                            onClick={() => {
                                                setValue("date", h.date);
                                                setValue("time", `${h.startTime} até ${h.endTime}`);
                                                setValue("availabilityUuid", h.id);
                                            }}
                                            className={`${watch("availabilityUuid") == h.id ? 'bg-brand-500 text-white' : ''} p-2 border rounded-lg hover:bg-brand-500 hover:text-white transition-colors`}>
                                            {h.startTime} - {h.endTime}
                                        </button>
                                    ))}
                            </div>
                        )}
                    </div>
                    <div className="col-span-2">
                        <Button onClick={() => {
                            setModalCreate(false);
                            setValue("date", "");
                            setValue("time", "");
                            setValue("availabilityUuid", "");
                            setSelectedDay(undefined);
                        }} type="button" className="w-full" size="sm" variant="outline">Cancelar</Button>
                    </div>
                    <div className="col-span-2">
                        <Button className="w-full" size="sm">Salvar</Button>
                    </div>
                </form>
            }

            {
                !modalCreate &&
                <div className="">
                    <ul className={`${modalCanceled ? 'max-h-[calc(80dvh-10.5rem)]' : 'max-h-[calc(80dvh-4rem)]'} overflow-y-auto flex flex-col gap-4`}>
                        {
                            appointments.map((ap: any) => {
                                return (
                                    <li key={ap.id} className="grid grid-cols-6 rounded-2xl border border-brand-200 bg-white p-3 dark:border-gray-800 dark:bg-white/3 md:p-6">
                                        <div className="col-span-4">
                                            <p className="text-sm font-medium text-brand-900 dark:text-gray-500">STATUS: <strong className={`font-bold ${normalizeNameStatus(ap.status)}`}>{normalizeStatus(ap.status)}</strong></p>
                                            <p className="text-sm font-medium text-brand-900 dark:text-gray-500">ESPECIALIDADE: <strong className="font-bold">{ap.specialtyName}</strong></p>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="flex flex-col justify-end items-end gap-3">                                      
                                                {
                                                    ap.status == "PENDING" &&
                                                    <button onClick={async () => {
                                                        setModalCreate(true);
                                                        reset(ap);
                                                        setValue("beneficiaryMedicalReferralUuid", ap.id);
                                                        setValue("beneficiaryUuid", ap.recipienId);
                                                        setValue("specialtyUuid", ap.specialtyId);
                                                        setValue("recipientName", ap.recipientDescription);
                                                        await getSelectSpecialtyAvailability(ap.specialtyId, ap.recipienId);
                                                    }} className="bg-green-500 shadow-theme-xs hover:bg-green-600 text-white flex items-center justify-center gap-1 rounded-lg w-26">
                                                        <MdOutlineCheck />                                                   
                                                        Agendar
                                                    </button>
                                                }
                                            </div>
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
            }
        </div>
    )
}