import { productModel, productValidator } from "../models/product.model";
import { IProduct } from "../interfaces/product.interface";
import { Request, Response } from "express";
import { unlink } from "fs";
import path from "path";
// import { error } from "console";

class ProductController {
    async createProduct(req: Request, res: Response): Promise<any> {
        try {
            const body: IProduct = req.body;

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
            const savedProduct: IProduct = await product.save();

            return res.status(200).json({
                status: 200,
                message: "Product created successfully!",
                data: savedProduct,
            });
        } catch (error: any) {
            console.error("error: ", error);
            return res.status(500).json({
                status: 500,
                message: "Invalid product data!",
                error,
            });
        }
    }

    async getAllProducts(req: Request, res: Response): Promise<any> {
        try {
            const products: Array<IProduct> = await productModel.find({ status: "Active" });
            return res.status(200).json({
                status: 200,
                message: "Products fetched successfully!",
                data: products,
            });
        } catch (error: any) {
            console.error("error: ", error);
            return res.status(500).json({
                status: 500,
                message: "Failed to fetch products!",
                error
            });
        }
    }

    async getProductById(req: Request, res: Response): Promise<any> {
        try {
            const productId: string = req.params.id;
            const product = await productModel.findOne({ _id: productId, status: "Active" });
            if (!product) {
                return res.status(404).json({
                    status: 404,
                    message: "Product not found!",
                });
            }
            return res.status(200).json({
                status: 200,
                message: "Product fetched successfully!",
                data: product,
            });

        } catch (error: any) {
            console.error("error: ", error);
            return res.status(500).json({
                status: 500,
                message: "Failed to fetch product!",
                error,
            });
        }
    }

    async updateProduct(req: Request, res: Response): Promise<any> {
        try {
            const productId: string = req.params.id;

            const existingProduct = await productModel.findById(productId);
            if (!existingProduct) {
                return res.status(404).json({
                    status: 404,
                    message: "Product not found!",
                });
            }

            const body: IProduct = {
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
                        const imagePathToDelete: string = path.join(__dirname, '../../uploads', imageName);
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
            const updatedProduct = await productModel.findByIdAndUpdate(productId, body, { new: true });
            return res.status(200).json({
                status: 200,
                message: "Product updated successfully!",
                data: updatedProduct,
            });
        } catch (error: any) {
            console.error("error: ", error);
            return res.status(500).json({
                status: 500,
                message: "Failed to update product!",
                error,
            });

        }
    }

    async softyDeleteProduct(req: Request, res: Response): Promise<any> {
        try {
            const productId: string = req.params.id;
            const existingProduct: IProduct | null = await productModel.findById(productId);
            if (!existingProduct) {
                return res.status(404).json({
                    status: 404,
                    message: "Product not found!",
                });
            }

            await productModel.findByIdAndUpdate(productId, { status: 'Deactive' });
            return res.status(200).json({
                status: 200,
                message: "Product deleted successfully!",
            });

        } catch (err: any) {
            console.error("err: ", err);
            return res.status(500).json({
                status: 500,
                message: "Failed to delete product!",
                error: err,
            });
        }
    }

    async deleteProductImage(req: Request, res: Response): Promise<any> {
        try {
            const productId: string = req.params.id;
            const imagePathToDelete: string = req.body.image;
            const existingProduct: IProduct | null = await productModel.findById(productId);
            if (!existingProduct) {
                return res.status(404).json({
                    status: 404,
                    message: "Product not found!",
                });
            }
            if (existingProduct.images.includes(imagePathToDelete)) {
                existingProduct.images = existingProduct.images.filter((image: string) => image !== imagePathToDelete);
                await productModel.findByIdAndUpdate(productId, { images: existingProduct.images });
                const imageName: string = imagePathToDelete.split('/').pop()!;
                unlink( path.join(__dirname, '..', '..', 'uploads', imageName), (err) => {
                    if (err) {
                        console.error(`Error deleting image: ${imagePathToDelete}`, err);
                    } else {
                        console.log(`Deleted image: ${imagePathToDelete}`);
                    }
                });
            } else {
                return res.status(400).json({
                    status: 400,
                    message: "Image not found in product!",
                });
            }

            return res.status(200).json({
                status: 200,
                message: "Image deleted successfully!",
            });
        }
        catch (error) {
            console.error("error: ", error);
            return res.status(500).json({
                status: 500,
                message: "Failed to delete image!",
                error,
            });
        }
    }
}

export default new ProductController();