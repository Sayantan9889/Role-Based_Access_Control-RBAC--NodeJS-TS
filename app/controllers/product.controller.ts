import { productModel, productValidator } from "../models/product.model";
import { IProduct } from "../interfaces/product.interface";
import { Request, Response } from "express";
import { unlink } from "fs";
import path from "path";

class ProductController {
    async createProduct(req: Request, res: Response): Promise<any> {
        try {
            const body:IProduct = req.body;

            const files = req.files;

            const baseImagePath: string = `${req.protocol}://${req.get('host')}`
            let imagePaths: string[] = [`${baseImagePath}/uploads/no-image.png`];
            if (files?.length) {
                imagePaths = (files as any).map((file: Express.Multer.File) => `${baseImagePath}/uploads/${file.filename}`);
            }

            body.images = imagePaths;
            // console.log("body: ", body);

            const { error } = productValidator.validate(body);
            if (error) {
                return res.status(400).json({
                    message: error.details[0].message || "Validation failed",
                    error
                });
            }

            const product = new productModel(body);
            // await product.validate();
            const savedProduct:IProduct = await product.save();

            res.status(200).json({
                status: 200,
                message: "Product created successfully!",
                data: savedProduct,
            });
        } catch (error: any) {
            console.error("error: ", error);
            res.status(500).json({
                status: 500,
                message: error.message || "Invalid product data!",
                error,
            });
        }
    }

    async getAllProducts(req: Request, res: Response): Promise<any> {
        try {
            const products:Array<IProduct> = await productModel.find().select(' -status');
            res.status(200).json({
                status: 200,
                message: "Products fetched successfully!",
                data: products,
            });
        } catch (error: any) {
            console.error("error: ", error);
            res.status(500).json({
                status: 500,
                message: error.message || "Failed to fetch products!",
                error
            });
        }
    }

    async getProductById(req: Request, res: Response): Promise<any> {
        try {
            const productId:string = req.params.id;
            const product = await productModel.findById(productId).select(' -status');
            if (!product) {
                return res.status(404).json({
                    status: 404,
                    message: "Product not found!",
                });
            }
            res.status(200).json({
                status: 200,
                message: "Product fetched successfully!",
                data: product,
            });

        } catch (error: any) {
            console.error("error: ", error);
            res.status(500).json({
                status: 500,
                message: error.message || "Failed to fetch product!",
                error,
            });
        }
    }

    async updateProduct(req: Request, res: Response): Promise<any> {
        try {
            const productId:string = req.params.id;

            const existingProduct = await productModel.findById(productId);
            if (!existingProduct) {
                return res.status(404).json({
                    status: 404,
                    message: "Product not found!",
                });
            }

            const body:IProduct = {
                name: req.body.name || existingProduct.name,
                price: req.body.price || existingProduct.price,
                description: req.body.description || existingProduct.description,
                images: existingProduct.images, // Preserve existing images if no new images are provided
                product_type: req.body.product_type || existingProduct.product_type,
                status: existingProduct.status
            };

            const files = req.files;
            const baseImagePath: string = `${req.protocol}://${req.get('host')}`
            let imagePaths: string[] = [];
            if (files?.length) {
                imagePaths = (files as any).map((file: Express.Multer.File) => `${baseImagePath}/uploads/${file.filename}`);
                body.images = imagePaths;

                // Delete existing images
                existingProduct.images.forEach((imagePath: string) => {
                    const imageName: string | undefined = imagePath.split('/').pop();
                    if (imageName) {
                        const imagePathToDelete:string = path.join(__dirname, '../../uploads', imageName);
                        unlink(imagePathToDelete, (err) => {
                            if (err) {
                                console.error(`Error deleting image: ${imagePathToDelete} - ${err.message}`);
                            } else {
                                console.log(`Deleted privious image: ${imagePath}`);
                            }
                        });
                    } else {
                        console.error(`Invalid previous image path: ${imagePath}`);
                    }
                });
            }

            // console.log("body: ", body);
            const updatedProduct = await productModel.findByIdAndUpdate(productId, body, { new: true }).select(' --status');
            res.status(200).json({
                status: 200,
                message: "Product updated successfully!",
                data: updatedProduct,
            });
        } catch (error: any) {
            console.error("error: ", error);
            res.status(500).json({
                status: 500,
                message: error.message || "Failed to update product!",
                error,
            });

        }
    }

    async softyDeleteProduct(req: Request, res: Response): Promise<any> {
        try {
            const productId:string = req.params.id;
            const existingProduct:IProduct|null = await productModel.findById(productId);
            if (!existingProduct) {
                return res.status(404).json({
                    status: 404,
                    message: "Product not found!",
                });
            }

            await productModel.findByIdAndUpdate(productId, {status: 'Deactive'});
            res.status(200).json({
                status: 200,
                message: "Product deleted successfully!",
            });
            
        } catch (err:any) {
            console.error("err: ", err);
            res.status(500).json({
                status: 500,
                message: err.message || "Failed to delete product!",
                error:err,
            });
        }
    }
}

export default new ProductController();