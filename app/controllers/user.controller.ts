import path from "path";
import { comparePassword, generateToken, hashPassword, sendVerificationEmail, verifyToken } from "../helpers/auth.helper";
import { userModel, userValidator } from "../models/user.model";
import { Request, Response } from "express";
import { unlink } from "fs";


class userController {
    async createUser(req: Request, res: Response) {
        try {
            const body = req.body;

            const existUser = await userModel.findOne({ email: body.email })
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

            const hashedPassword = await hashPassword(body.password);
            body.password = hashedPassword;
            delete body.confirmPassword;

            const file = req.file;
            const basePath: string = `${req.protocol}://${req.get('host')}/`;
            let imagePath: string = `${basePath}/assets/no-image.png`;
            if (file) {
                imagePath = `${basePath}/uploads/${file.filename}`;
            }
            body.image = imagePath;

            const { error } = userValidator.validate(body);
            if (error) {
                return res.status(400).json({
                    message: error.details[0].message || "Validation failed",
                    error
                });
            }

            const verificationToken = await generateToken({ email: body.email });

            let verification_mail = `http://${req.headers.host}/confirmation/${verificationToken}`;
            const mailOptions = {
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

            console.log("body: ", body);
            const data = new userModel(body);
            const newUser = await data.save();
            console.log("newUser: ", newUser);
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

    async verifyEmail(req: Request, res: Response) {
        try {
            const verificationToken = req.params.token;

            const userId = await verifyToken(verificationToken)

            const user = await userModel.findOne({ verificationToken });

            if (!user) {
                return res.status(400).json({
                    status: 400,
                    message: "Invalid verification token!",
                });
            }

            await userModel.findByIdAndUpdate(userId, { isVarified: true, isActive: true });

            return res.status(200).json({
                status: 200,
                message: "Your account has been verified successfully! You can now login.",
            });
        } catch (error: any) {
            console.log("error: ", error);
            return res.status(500).json({
                status: 500,
                message: error.message || "Something went wrong verifing your account! Please try again.",
                error: error,
            })
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const user: any = await userModel.findOne({ email }).select('-isActive -isVarified -updated_at');

            if (!user) {
                return res.status(400).json({
                    status: 400,
                    message: "Invalid email or password!",
                });
            }

            const isPasswordMatch = await comparePassword(password, user.password);

            if (!isPasswordMatch) {
                return res.status(400).json({
                    status: 400,
                    message: "Invalid email or password!",
                });
            }

            const token = await generateToken({ id: user._id, name: user.name, email: user.email, role: user.role });

            const _user = { ...user._doc, token }
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

    async getUserProfile(req: Request, res: Response) {
        try {
            const userId = req.body.id;
            const user = await userModel.findById(userId).select('-isActive -isVarified -updated_at -password');

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

    async updateUserProfile(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const body = req.body;
            body.password && delete body.password;

            const existingUser = await userModel.findById(userId).select('-isActive -isVarified -updated_at -password');

            if (!existingUser) {
                return res.status(404).json({
                    status: 404,
                    message: "User not found!",
                });
            }

            const file = req.file;
            if (file) {
                const basePath: string = `${req.protocol}://${req.get('host')}/`;
                const imagePath: string = `${basePath}/uploads/${file.filename}`;
                body.image = imagePath;

                const existingImageName: string | undefined = existingUser.image.split('/').pop();
                if (existingImageName && existingImageName !== 'no-image.png') {
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