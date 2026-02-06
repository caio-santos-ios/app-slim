export type TLogin = {
    cpf: string;
    password: string;
    codeAccess?: string;
}

export type TResetPassword = {
    phone: string;
    email: string;
    type: string;
    device: string;
    id: string;
    password: string;
    newPassword: string;
    codeAccess: string;
}