import { Model, Schema, model } from "mongoose";
import {object, ObjectSchema, string, number, array} from "joi";

interface IProduct {
    name: string,
    price: number,
    description: string,
    images: Array<string>,
    product_type: 'New'|'Used',
    status: 'Active'|'Deactive'
}

const productValidator:ObjectSchema<IProduct> = object({
    name: string().min(3).max(50).required(),
    price: number().min(0).required(),
    description: string().min(20).max(500).required(),
    images: array().items(string().required()).min(1),
    product_type: string().valid(['New', 'Used']),
    status: string().valid(['Active', 'Deactive'])
})

const productSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
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
});

const productModel = model<IProduct>("Product", productSchema);

export {productModel, productValidator};
export default productModel;