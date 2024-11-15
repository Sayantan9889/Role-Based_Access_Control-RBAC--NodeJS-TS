import express, { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helpers/auth.helper";
import { ITokenUser } from "../interfaces/auth-check.interface";

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.token;

    if (!token) {
        return res.status(401).json({
            status: 401,
            message: "Please provide a token!",
        });
    }

    const user:ITokenUser = await verifyToken(Array.isArray(token) ? token[0] : token) as ITokenUser;

    if (!user || user.role !== "admin") {
        return res.status(403).json({
            status: 403,
            message: "Unauthorized access! Only admin users can perform this action.",
        });
    }

    next();
}

export const isManager = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.token;

    if (!token) {
        return res.status(401).json({
            status: 401,
            message: "Please provide a token!",
        });
    }

    const user:ITokenUser = await verifyToken(Array.isArray(token) ? token[0] : token) as ITokenUser;

    if (!user || user.role !== "manager") {
        return res.status(403).json({
            status: 403,
            message: "Unauthorized access! Only manager users can perform this action.",
        });
    }

    next();
}


export const isEmployee = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.token;

    if (!token) {
        return res.status(401).json({
            status: 401,
            message: "Please provide a token!",
        });
    }

    const user:ITokenUser = await verifyToken(Array.isArray(token) ? token[0] : token) as ITokenUser;

    if (!user || user.role !== "employee") {
        return res.status(403).json({
            status: 403,
            message: "Unauthorized access! Only employee users can perform this action.",
        });
    }

    next();
}