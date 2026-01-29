export type TAppointment = {        
    id?: string;
    beneficiaryUuid: string;
    availabilityUuid: string;
    specialtyUuid: string;
    approveAdditionalPayment: boolean;

    date: string;
    time: string;
    recipientId: string;
    specialistId: string;
    recipientName: string;
    specialistName: string;
}

export const ResetAppointment: TAppointment = {
    id: "",
    beneficiaryUuid: "",
    availabilityUuid: "",
    specialtyUuid: "",
    approveAdditionalPayment: true,
    date: "",
    recipientId: "",
    recipientName: "",
    specialistId: "",
    specialistName: "",
    time: ""
}

export type TAppointmentSearch = {        
    beneficiaryUuid: string;
    status: string;
}

export const ResetAppointmentSearch: TAppointmentSearch = {
    beneficiaryUuid: "",
    status: "",
}