"use client";

import { useAtom } from "jotai";
import { loadingAtom } from "@/jotai/global/loading.jotai";
import VitalModal from "../vital-modal/VitalModal";
import { VitalModalAtom } from "@/jotai/vital/vital.jotai";
import { configApi, resolveResponse } from "@/service/config.service";
import { api } from "@/service/api.service";
import { useEffect, useState } from "react";
import { FaCircle, FaRegMoon } from "react-icons/fa";
import { IoIosNutrition } from "react-icons/io";
import { LuBrain } from "react-icons/lu";
import { NotData } from "@/components/not-data/NotData";
import Input from "@/components/form/input/Input";
import Label from "@/components/form/LabelForm";
import Button from "@/ui/Button";
import { montserrat } from "../dass21/Dass21";

export default function Vital() {
    const [_, setIsLoading] = useAtom(loadingAtom);
    const [modal, setModal] = useAtom(VitalModalAtom);
    const [historics, setHistoric] = useState<any[]>([]);
    const [card, setCard] = useState<any>({id: ''});
    const [startDate, setStartDate] = useState<string>("sem");
    const [endDate, setEndDate] = useState<string>("sem");

    const getAll = async () => {
        try {
            setIsLoading(true);
            const {data} = await api.get(`/vitals/beneficiary-all/${startDate}/${endDate}`, configApi());
            const result = data.result.data;

            setHistoric(result);
        } catch (error) {
            resolveResponse(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getColor = (metric: number) => {
        if (metric <= 60) return "text-red-400";
        if (metric > 60 && metric < 85) return "text-yellow-400";
        return "text-green-400";
    };

    const getColorText = (metric: number) => {
        if (metric <= 60) return "text-red-800";
        if (metric > 60 && metric < 85) return "text-yellow-800";
        return "text-green-800";
    };
    
    const getColorBorder = (metric: number) => {
        if (metric <= 60) return "border-red-400 bg-red-100";
        if (metric > 60 && metric < 85) return "border-yellow-400 bg-yellow-100";
        return "border-green-400 bg-green-200";
    };

    useEffect(() => {
        const initial = async () => {
            await getAll();
        };
        initial();
    }, []);

    return (
        <div className={`${montserrat.className}`}>
            {
                modal ?
                <VitalModal />
                :
                <div>
                    <h1 className="mb-1.5 block text-md font-bold text-brand-400">Bem Vital - Histórico</h1>
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
                            <Button onClick={getAll} type="button" variant="secondary" className="col-span-2" size="sm">Buscar</Button>
                        </div>

                        {
                            historics.length == 0 &&
                            <NotData h="30dvh" />
                        }

                        <ul className="max-h-[calc(100dvh-24rem)] overflow-y-auto">
                            {
                                historics.map((cardItem: any, i) => {
                                    return (
                                        <li onClick={() => {
                                            if(card.id == cardItem.id) {
                                                setCard({id: ''});
                                            } else {
                                                if(!card.id) {
                                                    setCard(cardItem);
                                                } else {
                                                    setCard({id: ''});
                                                };
                                            };
                                        }} key={i} className="grid grid-cols-12 items-center bg-white p-6 rounded-2xl border border-gray-200 mb-4">
                                            <div className="col-span-1">
                                                <FaCircle className={`${getColor(cardItem.metric.ipv)}`}/>
                                            </div>
                                            <div className="col-span-8">
                                                <p className="text-brand-500 text-sm font-medium">{cardItem.metric.day}</p>
                                                <span className="text-brand-400 font-bold text-sm">{cardItem.sleepHours}h sono • {cardItem.waterAmount} ml água</span>
                                            </div>
                                            <div className="col-span-3 text-end">
                                                <p className={`${getColor(cardItem.metric.ipv)} font-bold`}>{cardItem.metric.ipv}</p>
                                            </div>

                                            {
                                                cardItem.id == card.id &&
                                                <div className="col-span-12 flex">
                                                    <div className="flex justify-between w-full gap-2">

                                                        <div className={`w-30 flex flex-col items-center rounded-lg border ${getColorBorder(cardItem.metric.igs)} ${getColorText(cardItem.metric.igs)}`}>
                                                            <div className="p-4 rounded-lg">
                                                                <FaRegMoon />
                                                            </div>
                                                            <h2 className="">Sono</h2>
                                                            <span className="">{cardItem.metric.igs}</span>
                                                        </div>

                                                        <div className={`w-30 flex flex-col items-center rounded-lg border ${getColorBorder(cardItem.metric.ign)} ${getColorText(cardItem.metric.ign)}`}>
                                                            <div className="p-4 rounded-lg">
                                                                <IoIosNutrition />
                                                            </div>
                                                            <h2 className="">Nutrição</h2>
                                                            <span className="">{cardItem.metric.ign}</span>
                                                        </div>

                                                        <div className={`w-30 flex flex-col items-center rounded-lg border ${getColorBorder(cardItem.metric.ies)} ${getColorText(cardItem.metric.ies)}`}>
                                                            <div className="p-4 rounded-lg">
                                                                <LuBrain />
                                                            </div>
                                                            <h2 className="">Mental</h2>
                                                            <span className="">{cardItem.metric.ies}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div>
                </div>
            }
        </div>
    );
}