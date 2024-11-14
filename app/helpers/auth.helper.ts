import { sign, verify } from "jsonwebtoken";
import { compare, genSaltSync, hashSync } from "bcryptjs";
import { createTransport, Transporter } from "nodemailer";
import { ITokenUser } from "../interfaces/auth-check.interface";




const hashPassword = async (password: string): Promise<string> => {
    try {
        const salt = genSaltSync(10);
        return hashSync(password, salt);
    } catch (error: any) {
        throw new Error(error.message || 'Something went wrong during hashing your password!');
    }
}

const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    try {
        return await compare(password, hashedPassword)
    } catch (error: any) {
        throw new Error(error.message || 'Something went wrong during varifying your password!');
    }
}


const generateToken = async (user: ITokenUser): Promise<string> => {
    try {
        const token = sign(user, process.env.JWT_SECRET!, { expiresIn: '1d' });
        return token;
    } catch (error: any) {
        throw new Error(error.message || 'Something went wrong during generating token!');
    }
}

const verifyToken = async (token: string): Promise<ITokenUser> => {
    try {
        const user: ITokenUser = verify(token, process.env.JWT_SECRET!) as ITokenUser;
        return user;
    } catch (error: any) {
        throw new Error(error.message || 'Invalid or expired token!');
    }
}

const mailTransporter = async ():Promise<Transporter<any>> => {
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

const sendVerificationEmail = async (mailOptions:any): Promise<void> => {
    try {
        const transporter = await mailTransporter();
        // let verification_mail = `http://${req.headers.host}/confirmation/${user.email}/${token.token}`;
        // const mailOptions = {
        //     from: 'no-reply@sayantan.com',
        //     to: user.email,
        //     subject: 'Account Verification',
        //     html: `
        //         <h1>Hello, ${body.name}</h1>
        //         <p>Please verify your account by clicking the link below:</p>
        //         <a href="${verification_mail}" style="color: blue;">${verification_mail}</a>
        //         <p>Thank you!</p>
        //     `
        // };
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent successfully!");
        
    } catch (error: any) {
        throw new Error(error.message || 'Failed to send verification email!');
    }
}