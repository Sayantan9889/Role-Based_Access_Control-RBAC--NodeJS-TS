import { Model, Schema, model } from "mongoose";
import joi, { ObjectSchema } from "joi";
import { IProduct } from "../interfaces/product.interface";


const productValidator: ObjectSchema<IProduct> = joi.object({
    name: joi.string().min(3).max(50).required(),
    price: joi.number().min(0).required(),
    description: joi.string().min(20).max(500).required(),
    images: joi.array().items(joi.string().required()).min(1),
    product_type: joi.string().valid('New', 'Used'),
    status: joi.string().valid('Active', 'Deactive')
})

const productSchema:Schema<IProduct> = new Schema<IProduct>({
    name: {
        type: String,
        required: true,
        index: true,
    },
    price: {
        type: Number,
        required: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
    },
    images: [{
        type: String,
        required: true,
    }],
    product_type: { type: String, default: 'New', enum: ['New', 'Used'] },
    status: { type: String, default: 'Active', enum: ['Active', 'Deactive'] },
}, {timestamps:true, versionKey:false});

const productModel:Model<IProduct> = model<IProduct>("Product", productSchema);

export { productModel, productValidator };
export default productModel;