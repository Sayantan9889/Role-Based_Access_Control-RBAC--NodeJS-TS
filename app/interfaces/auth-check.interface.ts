export interface ITokenUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface IVerificationToken {
    email: string;
}

export interface IMailOptions {
    from: string;
    to: string;
    subject: string;
    html: string;
}