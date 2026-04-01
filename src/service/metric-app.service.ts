import { TMetricApp } from "@/types/metric-app/metric-app.type";
import { configApi, resolveResponse } from "./config.service";
import { api } from "./api.service";

export const createMetricAppService = async (data: TMetricApp) => {
    try {
        await api.post(`/metric-apps`, data, configApi());
    } catch (error) {
        resolveResponse(error);
    }
}