export interface ITokenUser{
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface IVerificationToken {
    email: string;
}