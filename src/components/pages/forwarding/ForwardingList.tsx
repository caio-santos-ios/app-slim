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
import { montserrat } from "../dass21/Dass21";
import { NotData } from "@/components/not-data/NotData";

export const ForwardingList = () => {
    const [__, setIsLoading] = useAtom(loadingAtom);
    const [modalCreate, setModalCreate] = useState<boolean>(false);
    const [modalCanceled, setModalCanceled] = useState<boolean>(false);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [appointmentsFilted, setAppointmentsFilted] = useState<any[]>([]);
    const [specialties, setSpecialty] = useState<any[]>([]);
    const [specialtyAvailabilities, setSpecialtyAvailabilities] = useState<any[]>([]);
    const [selectedDay, setSelectedDay] = useState<Date | undefined>();
    const [specialtyName, setSpecialtyName] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [status, setStatus] = useState<string>("");

    const diasComHorario = specialtyAvailabilities.map(h => {
        const [dia, mes, ano] = h.date.split("/");
        return new Date(Number(ano), Number(mes) - 1, Number(dia));
    });
    
    const { reset, register, setValue, getValues, watch, handleSubmit } = useForm<TAppointment>();
    const { reset: resetCancel, register: registerCancel, watch: watchCancel, handleSubmit: handleSubmitCancel } = useForm<TAppointment>();

    const save: SubmitHandler<TAppointment> = async (body: TAppointment) => {
        try {
            const name = localStorage.getItem("name");
            const cpf = localStorage.getItem("cpf");
            const form = {...body, beneficiaryName: name ? name : "", beneficiaryCPF: cpf ? cpf : ""};

            setIsLoading(true);
            const {data} = await api.post(`/forwardings`, form, configApi());
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

    const saveAppointment: SubmitHandler<TAppointment> = async (body: TAppointment) => {
        try {
            setIsLoading(true);
            await api.post(`/appointments`, body, configApi());
            resolveResponse({status: 200, message: 'Agendado com sucesso!'});

            const rapidocId = localStorage.getItem("rapidocId");
            await getAppointments(rapidocId ? rapidocId : "");
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getAll = async (rapidocId: string) => {
        try {
            const {data} = await api.get(`/forwardings/${rapidocId}`, configApi());
            const result = data.result.data;
            setAppointments(result);

            const name = localStorage.getItem("name");
            setValue("recipientName", name ? name : "");
            setValue("beneficiaryUuid", rapidocId ? rapidocId : "");
            await getSelectSpecialty(result);
        } catch (error) {
            resolveResponse(error);
        }
    };
    
    const getAppointments = async (rapidocId: string) => {
        try {
            const {data} = await api.get(`/appointments/user/${rapidocId}`, configApi());
            const result = data.result.data;
            await getSelectSpecialty(result);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getSelectSpecialty = async (listAppointments: any[]) => {
        try {
            const {data} = await api.get(`/appointments/specialties`, configApi());
            const result = data.result;
            
            const nutricao = result?.data.find((x: any) => x.name == "Nutrição")
            
            const name = localStorage.getItem("name");
            const rapidocId = localStorage.getItem("rapidocId");
            
            const newList = listAppointments.filter(x => x.specialtyUuid == nutricao.id).map(x => ({...x, status: normalizeStatus(x.status)}));
            
            setAppointments(newList);
            setAppointmentsFilted(newList);
            setValue("specialtyUuid", nutricao.id);
            setValue("specialistId", nutricao.id);
            setValue("specialistName", nutricao.name);
            setValue("recipientName", name ? name : "");
            setValue("beneficiaryUuid", rapidocId ? rapidocId : "");
            
            await getSelectSpecialtyAvailability(nutricao.id, rapidocId ? rapidocId : "");
        } catch (error) {
            resolveResponse(error);
        }
    };

    const getSelectSpecialtyAvailability = async (specialtyUuid: string, beneficiaryUuid: string) => {
        try {
            const {data} = await api.get(`/appointments/specialty-availability/${specialtyUuid}/${beneficiaryUuid}`, configApi());
            const result = data.result;
            setSpecialtyAvailabilities(result.data ?? []);
        } catch (error) {
            resolveResponse(error);
        }
    };

    const normalizeStatus = (status: string) => {
        switch(status) {
            case "FINISHED": return "Finalizado";
            case "PENDING": return "Pedente";
            case "SCHEDULED": return "Agendado";
            case "CANCELED": return "Cancelado";
            default: return status;
        }
    };

    const normalizeNameStatus = (status: string) => {
        switch(status) {
            case "Finalizado": return "text-green-500";
            case "Pedente": return "text-yellow-500";
            case "Agendado": return "text-blue-500";
            case "Cancelado": return "text-red-500";
            default: return status;
        }
    };

    const cancel: SubmitHandler<TAppointment> = async (body: TAppointment) => {
        try {
            const name = localStorage.getItem("name");
            const form = {...body, beneficiaryName: name ? name : "", specialtyName};
            setIsLoading(true);
            
            await api.put(`/appointments/cancel`, form, configApi());
            resolveResponse({status: 200, message: 'Cancelado com sucesso!'});
            setModalCanceled(false);
            setModalCreate(false);
            const rapidocId = localStorage.getItem("rapidocId");
            await getAll(rapidocId ? rapidocId : "");
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const search = () => {
        let list = [...appointmentsFilted];

        if (startDate) {
            list = list.filter(x => {
                const itemData = x.data.split('T')[0];
                return itemData >= startDate;
            });
        };

        if (endDate) {
            list = list.filter(x => {
                const itemData = x.data.split('T')[0];
                return itemData <= endDate;
            });
        };

        if (status) {
            list = list.filter(x => x.status === status);
        };

        setAppointments(list);
    };

    useEffect(() => {
        if(selectedDay) {
            const existed = specialtyAvailabilities.find(h => h.date === selectedDay.toLocaleDateString('pt-BR'));
            if(!existed) toast.warn(`Nenhum horario disponível para o dia ${selectedDay.toLocaleDateString('pt-BR')}`, {theme: 'colored'});
        }
    }, [selectedDay]);

    useEffect(() => {
        const initial = async () => {
            setIsLoading(true);
            const rapidocId = localStorage.getItem("rapidocId");
            await getAll(rapidocId ? rapidocId : "");
            await getAppointments(rapidocId ? rapidocId : "");
            setIsLoading(false);
        }
        initial();
    }, [])
    
    return (
        <div className={`${montserrat.className}`}>
            {
                !modalCreate && !modalCanceled &&
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="col-span-1">
                        <Label label="Período Inicial" required={false}/>
                        <Input type="date" onInput={(e: any) => setStartDate(e.target.value)} />
                    </div>
                    <div className="col-span-1">
                        <Label label="Período Final" required={false}/>
                        <Input type="date" onInput={(e: any) => setEndDate(e.target.value)} />
                    </div>
                    <div className="col-span-1">
                        <Label label="Status" required={false}/>
                        <select className="h-11 w-full bg-white border border-gray-200 focus:border-(--color-brand-200) focus:outline-hidden rounded-lg px-3 py-2"
                            onChange={(e) => {
                                const val = e.target.value;
                            }}>
                            <option value="">Todos</option>
                            <option value="Finalizado">Finalizado</option>
                            <option value="Pedente">Pedente</option>
                            <option value="Agendado">Agendado</option>
                            <option value="Cancelado">Cancelado</option>
                        </select>
                    </div>

                    <Button onClick={search} type="button" variant="secondary" className="col-span-1 h-11 self-end" size="sm">Buscar</Button>
                </div>
            }
            {
                appointments.length == 0 && !modalCanceled && !modalCreate &&
                <NotData h="[10dvh]" />
            }
            {
                !modalCanceled && !modalCreate &&
                <div className="mb-4">
                    <Button onClick={() => setModalCreate(true)} type="button" className="w-full" size="sm">Fazer agendamento</Button>
                </div>
            }
            {/* {
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
                        }} type="button" className="w-full" size="sm" variant="outline-primary">Cancelar</Button>
                    </div>
                    <div className="col-span-2">
                        <Button className="w-full" size="sm">Salvar</Button>
                    </div>
                </form>
            } */}
            {
                modalCreate &&
                <form onSubmit={handleSubmit(save)} className="grid grid-cols-4 gap-4 max-h-[calc(80dvh-6rem)] overflow-y-auto">                
                    <div className="col-span-4">
                        <Label label="Especialista" required={false}/>
                        <Input disabled {...register("specialistName")} placeholder="Especialista"/>
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
                        }} type="button" className="w-full" size="sm" variant="outline-primary">Cancelar</Button>
                    </div>
                    <div className="col-span-2">
                        <Button onClick={() => saveAppointment({...getValues()})} type="button" className="w-full" size="sm">Salvar</Button>
                    </div>
                </form>
            }
            {
                modalCanceled &&
                <div className="rounded-2xl border border-brand-200 bg-brand-200 p-3 mb-8">
                    <form onSubmit={handleSubmitCancel(cancel)} className="grid grid-cols-4 gap-4">
                        <div className="col-span-4">
                            <h1 className="mb-1.5 block text-md font-bold text-white">Deseja cancelar o Agendamento?</h1>
                        </div>
                        <Button className="col-span-2" onClick={() => setModalCanceled(false)} type="button" variant="outline-primary" size="sm">Não, fechar</Button>
                        <Button className="col-span-2" size="sm">Confirmar</Button>
                    </form>
                </div>
            }
            {
                !modalCreate &&
                <div className="">
                    <ul className={`${modalCanceled ? 'max-h-[calc(80dvh-10.5rem)]' : 'max-h-[calc(80dvh-4rem)]'} overflow-y-auto flex flex-col gap-1`}>
                        {
                            appointments.map((ap: any) => {
                                return (
                                    <li key={ap.id} className="grid grid-cols-8 bg-white p-4 rounded-2xl border border-gray-200 mb-3">
                                        <div className="col-span-6">
                                            <p className="text-sm font-medium text-brand-900 dark:text-gray-500">DATA: <strong className="font-bold">{ap.date}</strong></p>
                                            <p className="text-sm font-medium text-brand-900 dark:text-gray-500">HORARIO: <strong className="font-bold">{ap.startTime} até {ap.endTime}</strong></p>
                                            <p className="text-sm font-medium text-brand-900 dark:text-gray-500">STATUS: <strong className={`font-bold ${normalizeNameStatus(ap.status)}`}>{normalizeStatus(ap.status)}</strong></p>
                                            <p className="text-sm font-medium text-brand-900 dark:text-gray-500">ESPECIALIDADE: <strong className="font-bold">{ap.specialty}</strong></p>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="flex flex-col justify-end items-end gap-3">                                      
                                                {
                                                    ap.status == "PENDING" &&
                                                    <button onClick={async () => {
                                                        setModalCreate(true);
                                                        reset(ap);
                                                        setValue("parentId", ap.id);
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
                                                {
                                                    ap.status == "SCHEDULED" &&
                                                    <button onClick={() => {
                                                        setSpecialtyName(ap.specialty);
                                                        setValue("beneficiaryName", ap.recipientName);
                                                        setModalCanceled(true);
                                                        resetCancel(ap);
                                                    }} className="bg-red-500 shadow-theme-xs hover:bg-red-600 text-white flex items-center gap-1 px-2 rounded-lg">
                                                        <MdOutlineCancel/>                                                   
                                                        Cancelar
                                                    </button>
                                                }
                                                {
                                                    ap.status == "SCHEDULED" &&
                                                    <Link href={ap.beneficiaryUrl} className="bg-blue-500 shadow-theme-xs hover:bg-blue-600 text-white flex items-center gap-1 px-2 rounded-lg">
                                                        <IoIosVideocam/>                                                   
                                                        Consulta
                                                    </Link>
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