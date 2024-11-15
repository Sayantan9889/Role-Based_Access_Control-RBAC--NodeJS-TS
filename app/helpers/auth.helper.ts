import { sign, verify } from "jsonwebtoken";
import { compare, genSaltSync, hashSync } from "bcryptjs";
import { createTransport, Transporter } from "nodemailer";
import { IMailOptions, ITokenUser, IVerificationToken } from "../interfaces/auth-check.interface";




export const hashPassword = async (password: string): Promise<string> => {
    try {
        const salt = genSaltSync(10);
        return hashSync(password, salt);
    } catch (error: any) {
        throw new Error(error.message || 'Something went wrong during hashing your password!');
    }
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    try {
        return await compare(password, hashedPassword)
    } catch (error: any) {
        throw new Error(error.message || 'Something went wrong during varifying your password!');
    }
}


export const generateToken = async (user: ITokenUser | IVerificationToken): Promise<string> => {
    try {
        const token = sign(user, process.env.JWT_SECRET!, { expiresIn: '1d' });
        return token;
    } catch (error: any) {
        throw new Error(error.message || 'Something went wrong during generating token!');
    }
}

export const verifyToken = async (token: string): Promise<ITokenUser | IVerificationToken> => {
    try {
        const user: ITokenUser = verify(token, process.env.JWT_SECRET!) as ITokenUser;
        return user;
    } catch (error: any) {
        throw new Error(error.message || 'Invalid or expired token!');
    }
}

export const mailTransporter = async ():Promise<Transporter<any>> => {
    try {
        return createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for port 465, false for other ports
            auth: {
                user: process.env.GMAIL!,
                pass: process.env.GMAIL_PASSWORD!,
            },
        });
    } catch (error:any) {
        throw new Error(error.message || 'Failed to create mail transporter!');
    }
}

export const sendVerificationEmail = async (mailOptions:IMailOptions): Promise<void> => {
    try {
        const transporter = await mailTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log("Verification email sent successfully!", info);
    } catch (error: any) {
        throw new Error(error.message || 'Failed to send verification email!');
    }
}