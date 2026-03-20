"use client";

import { useAtom } from "jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import VitalModal from "../vital-modal/VitalModal";
import { VitalModalAtom } from "@/jotai/vital/vital.jotai";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { FaCircle, FaRegMoon } from "react-icons/fa";
import { IoIosNutrition, IoIosWarning } from "react-icons/io";
import { LuBrain } from "react-icons/lu";
import { NotData } from "@/components/not-data/NotData";
import Input from "@/components/form/input/Input";
import Label from "@/components/form/LabelForm";
import Button from "@/ui/Button";
import { montserrat } from "../dass21/Dass21";
import { maskDate } from "@/utils/mask.util";
import Link from "next/link";

export default function HistoricPoint() {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [historics, setHistoric] = useState<any[]>([]);
    const [startDate, setStartDate] = useState<string>("sem");
    const [endDate, setEndDate] = useState<string>("sem");

    const getAll = async () => {
        try {
            setIsLoading(true);
            const {data} = await api.get(`/vitals/beneficiary-all/${startDate}/${endDate}`, configApi());
            const result = data.result.data;

            const list: any[] = [];
            result.map((x: any) => {

                if(x.chekinIGS) {
                    list.push({
                        date: maskDate(x.createdAt),
                        description: "Check-in do Sono",
                        point: 5,
                        extrasPoint: x.extrasPoint
                    });
                };

                if(x.chekinIGN) {
                    list.push({
                        date: maskDate(x.createdAt),
                        description: "Check-in da Nutrição",
                        point: 5,
                        extrasPoint: x.extrasPoint
                    });
                };
                
                if(x.chekinIES) {
                    list.push({
                        date: maskDate(x.createdAt),
                        description: "Check-in da Saúde Mental",
                        point: 5,
                        extrasPoint: x.extrasPoint
                    });
                };
            });

            setHistoric(list);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const initial = async () => {
            await getAll();
        };
        initial();
    }, []);

    return (
        <div>
            <h1 className="mb-1.5 block text-md font-bold text-brand-400">Histórico de Pontos</h1>
            <div className="max-h-[calc(100dvh-13rem)] overflow-y-auto">
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="col-span-1">
                        <Label label="Data Inicial" required={false}/>
                        <Input type="date" onInput={(e: any) => setStartDate(e.target.value)} />
                    </div>
                    <div className="col-span-1">
                        <Label label="Data Final" required={false}/>
                        <Input type="date" onInput={(e: any) => setEndDate(e.target.value)} />
                    </div>
                    <Link href="/home/ranking" className="col-span-1">
                        <Button type="button" variant="outline-secondary" className="w-full" size="sm">Voltar</Button>
                    </Link>
                    <Button onClick={getAll} type="button" variant="secondary" className="col-span-1" size="sm">Buscar</Button>
                </div>

                {
                    historics.length == 0 &&
                    <NotData h="30dvh" />
                }

                <ul className="max-h-[calc(100dvh-24rem)] overflow-y-auto">
                    {
                        historics.map((cardItem: any, i) => {
                            return (
                                <li key={i} className="grid grid-cols-12 items-center bg-white p-6 rounded-2xl border border-gray-200 mb-4">
                                    <div className="col-span-9">
                                        <p className={`text-brand-500 text-sm font-medium`}>{cardItem.description}</p>
                                    </div> 
                                    <div className="col-span-3 text-end">
                                        <p className={`text-brand-500 text-sm font-medium`}>{cardItem.date}</p>
                                    </div>
                                    <div className="col-span-12 text-end">
                                        <div className={`flex gap-2 ${cardItem.extrasPoint == 0 ? 'justify-end':'justify-between'}`}>
                                            {
                                                cardItem.extrasPoint > 0 &&
                                                <div className="flex items-center gap-2 text-brand-2-500">
                                                    <IoIosWarning />
                                                    <span className="text-xs font-semibold">Bônus por sequência 🔥 +1</span>
                                                </div>
                                            }
                                            <span className="text-brand-2-500 font-bold whitespace-nowrap">+5 pts</span>
                                        </div>
                                    </div>
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
        </div>
    );
}