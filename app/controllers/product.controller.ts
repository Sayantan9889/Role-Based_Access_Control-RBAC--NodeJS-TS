import { productModel } from "../models/product.model";
import { Request, Response } from "express";
import { unlink } from "fs";
import path from "path";

class ProductController {
    async createProduct(req: Request, res: Response):Promise<any> {
        try {
            const body = req.body;

            const files = req.files;

            const baseImagePath:string = `${req.protocol}://${req.host}`
            let imagePaths:string[] = [`${baseImagePath}/uploads/no-image.png`];
            if (files?.length) {
                
                // imagePaths = files.map((file: Express.Multer.File) => {
                //     const uniqueSuffix: string = Date.now() + '-' + Math.round(Math.random() * 1E9);
                //     const filename: string = `${uniqueSuffix}${path.extname(file.originalname)}`;
                //     const filePath: string = path.join(process.cwd(), 'uploads', filename);
                //     file.mv(filePath, async (err) => {
                //         if (err) {
                //             await unlink(filePath);
                //             throw new Error("Failed to upload image!");
                //         }
                //     });
                //     return `${baseImagePath}/uploads/${filename}`;
                // });
            }

            body.images = imagePaths;

            // const { error } = productValidator.validate(body);
            // if (error) {
            //     return res.status(400).json({
            //         message: error.details[0].message || "Validation failed",
            //         error,
            //     });
            // }

            const product = new productModel(body);
            // await product.validate();
            const savedProduct = await product.save();

            res.status(200).json({
                status: 200,
                message: "Product created successfully!",
                data: savedProduct,
            });
        } catch (error: any) {
            res.status(500).json({
                status: 500,
                message: error.message || "Invalid product data!",
                error,
            });
        }
    }

    async getAllProducts(req: Request, res: Response): Promise<any> {
        try {
            const products = await productModel.find();
            res.status(200).json({
                status: 200,
                message: "Products fetched successfully!",
                data: products,
            });
        } catch (error: any) {
            res.status(500).json({
                status: 500,
                message: error.message || "Failed to fetch products!",
                error,
            });
        }
    }
}

export default new ProductController();