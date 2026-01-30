export type TAppointment = {        
    id?: string;
    beneficiaryUuid: string;
    availabilityUuid: string;
    specialtyUuid: string;
    beneficiaryMedicalReferralUuid: string;
    approveAdditionalPayment: boolean;

    date: string;
    time: string;
    recipientId: string;
    specialistId: string;
    recipientName: string;
    beneficiaryName: string;
    specialistName: string;
    specialtyName: string;
    parentId: string;
}

export const ResetAppointment: TAppointment = {
    id: "",
    beneficiaryUuid: "",
    availabilityUuid: "",
    beneficiaryMedicalReferralUuid: "",
    specialtyUuid: "",
    approveAdditionalPayment: true,
    date: "",
    recipientId: "",
    recipientName: "",
    specialistId: "",
    specialistName: "",
    specialtyName: "",
    parentId: "",
    time: "",
    beneficiaryName: ""
}

export type TAppointmentSearch = {        
    beneficiaryUuid: string;
    status: string;
}

export const ResetAppointmentSearch: TAppointmentSearch = {
    beneficiaryUuid: "",
    status: "",
}