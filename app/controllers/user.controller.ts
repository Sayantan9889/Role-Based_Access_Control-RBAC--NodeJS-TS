import { userModel, userValidator } from "../models/user.model";
import { Request, Response } from "express";


class userController {
    async createUser(req: Request, res: Response) {
        try {

        } catch (error: any) {
            console.log("error: ", error);
            res.status(500).json({
                message: error.message || "Something went wrong! Please try again.",
                error: error,
            })
        }
    }
}

export default new userController();