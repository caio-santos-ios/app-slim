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
    specialistName: string;
    specialtyName: string;
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