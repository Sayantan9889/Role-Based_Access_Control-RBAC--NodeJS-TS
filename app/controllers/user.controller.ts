import { comparePassword, generateToken, hashPassword, sendVerificationEmail, verifyToken } from "../helpers/auth.helper";
import { userModel, userValidator } from "../models/user.model";
import { IUser } from "../interfaces/user.interface";
import { Request, Response } from "express";
import { unlink } from "fs";
import path from "path";
import { IMailOptions, ITokenUser, IVerificationToken } from "../interfaces/auth-check.interface";


class userController {
    async createUser(req: Request, res: Response): Promise<any> {
        try {
            const body: IUser = req.body;

            const existUser: IUser | null = await userModel.findOne({ email: body.email })
            if (existUser) {
                return res.status(400).json({
                    message: "Email already exists!",
                });
            }

            if (body.password !== body.confirmPassword) {
                return res.status(400).json({
                    message: "Passwords do not match!",
                });
            }

            const hashedPassword: string = await hashPassword(body.password);
            body.password = hashedPassword;
            delete body.confirmPassword;

            const file:any = (req.files as any)[0];
            console.log("file: ", file);
            const basePath: string = `${req.protocol}://${req.get('host')}`;
            let imagePath: string = `${basePath}/uploads/blank-profile-pic.jpg`;
            if (file) {
                imagePath = `${basePath}/uploads/${file.filename}`;
                console.log("imagePath: ", imagePath);
            }
            body.image = imagePath;

            const { error } = userValidator.validate(body);
            if (error) {
                return res.status(400).json({
                    status: 400,
                    message: error.details[0].message || "Validation failed!",
                    error
                });
            }

            const verificationToken: string = await generateToken({ email: body.email });

            let verification_mail: string = `http://${req.headers.host}/api/account/confirmation/${verificationToken}`;
            const mailOptions: IMailOptions = {
                from: 'no-reply@sayantan.com',
                to: body.email,
                subject: 'Account Verification',
                html: `
                <h1>Hello, ${body.name}</h1>
                <p>Please verify your account by clicking the link below:</p>
                <a href="${verification_mail}" style="color: blue;">${verification_mail}</a>
                <p>Thank you!</p>
            `
            };

            await sendVerificationEmail(mailOptions);

            const data = new userModel(body);
            const newUser: IUser = await data.save();

            return res.status(200).json({
                status: 200,
                message: `${newUser.name} thank you for Registering! A verification email will be sent to your mail. Please verify and login.`,
                user: newUser,
            });
        } catch (error: any) {
            console.log("error: ", error);
            return res.status(500).json({
                status: 500,
                message: error.message || "Something went wrong! Please try again.",
                error: error,
            })
        }
    }

    async verifyEmail(req: Request, res: Response): Promise<any> {
        try {
            const verificationToken: string = req.params.token;

            const tokenData: IVerificationToken = await verifyToken(verificationToken)

            const user: IUser | null = await userModel.findOne({ email: tokenData.email });

            if (!user) {
                return res.status(400).json({
                    status: 400,
                    message: "Invalid verification token!",
                });
            }

            await userModel.findByIdAndUpdate(user._id, { isVarified: true, isActive: true });

            console.log("res: ", res);
            return res.redirect(`http://localhost:4200/login?verified=true`);
            // return res.status(200).json({
            //     status: 200,
            //     message: "Your account has been verified successfully! You can now login.",
            // });
        } catch (error: any) {
            console.error("error: ", error);
            return res.redirect(`http://localhost:4200/login?verified=false`);
            // return res.status(500).json({
            //     status: 500,
            //     message: error.message || "Something went wrong verifing your account! Please try again.",
            //     error: error,
            // })
        }
    }

    async loginUser(req: Request, res: Response): Promise<any> {
        try {
            const { email, password } = req.body;
            const user: IUser | null = await userModel.findOne({ email });

            if (!user) {
                return res.status(400).json({
                    status: 400,
                    message: "Invalid email or password!",
                });
            }

            if (!user.isVarified) {
                return res.status(400).json({
                    status: 400,
                    message: "Your account is not verified! Please verify your account by clicking the link sent to your mail.",
                });
            }


            const isPasswordMatch: boolean = await comparePassword(password, user.password);

            if (!isPasswordMatch) {
                return res.status(400).json({
                    status: 400,
                    message: "Invalid email or password!",
                });
            }

            const token: string = await generateToken({ id: user._id, name: user.name, email: user.email, role: user.role });

            const _user = { ...(user as any)._doc, token }
            delete _user.password;

            return res.status(200).json({
                status: 200,
                message: `Welcome ${user.name}!`,
                data: _user
            });
        } catch (error: any) {
            console.log("error: ", error);
            return res.status(500).json({
                status: 500,
                message: error.message || "Something went wrong! Please try again.",
                error: error,
            })
        }
    }

    async getUserProfile(req: Request, res: Response): Promise<any> {
        try {
            const userId: string = req.body.id;
            const user: IUser | null = await userModel.findById(userId).select('-isActive -isVarified -updated_at -password');

            if (!user) {
                return res.status(404).json({
                    status: 404,
                    message: "User not found!",
                });
            }

            return res.status(200).json({
                status: 200,
                message: "User profile fetched successfully!",
                data: user
            });
        } catch (error: any) {
            console.log("error: ", error);
            return res.status(500).json({
                status: 500,
                message: error.message || "Something went wrong! Please try again.",
                error: error,
            })
        }
    }

    async updateUserProfile(req: Request, res: Response): Promise<any> {
        try {
            const userId: string = req.params.id;
            const body = req.body;
            body.password && delete body.password;

            const existingUser = await userModel.findById(userId);

            if (!existingUser) {
                return res.status(404).json({
                    status: 404,
                    message: "User not found!",
                });
            }

            const file = req.file;
            if (file) {
                const basePath: string = `${req.protocol}://${req.get('host')}`;
                const imagePath: string = `${basePath}/uploads/${file.filename}`;
                body.image = imagePath;

                const existingImageName: string | undefined = existingUser.image.split('/').pop();
                if (existingImageName && existingImageName !== 'blank-profile-pic.jpg') {
                    unlink(path.join(__dirname, '..', '..', 'uploads', existingImageName), (err) => {
                        if (err) console.error(`Error deleting image: ${err}`);
                        else {
                            console.log('Old images deleted successfully');
                        }
                    });
                }
            }

            const user = await userModel.findByIdAndUpdate(userId, body, { new: true }).select('-isActive -isVarified -updated_at -password');

            return res.status(200).json({
                status: 200,
                message: "Profile updated successfully!",
                user,
            });
        } catch (error: any) {
            console.log("error: ", error);
            return res.status(500).json({
                status: 500,
                message: error.message || "Something went wrong! Please try again.",
                error: error,
            })
        }
    }
}

export default new userController();