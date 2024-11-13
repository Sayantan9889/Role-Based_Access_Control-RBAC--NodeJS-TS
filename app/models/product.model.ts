import { Model, Schema, model } from "mongoose";
import {object, ObjectSchema, string, number, array} from "joi";

interface IProduct {
    _id: Schema.Types.ObjectId;
    name: string;
    price: number;
    description: string,
    images: Array<string>
}

const productValidator:ObjectSchema<IProduct> = object({
    name: string().min(3).max(50).required(),
    price: number().min(0).required(),
    description: string().min(20).max(500).required(),
    images: array().items(string().required()).min(1)
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
    }]
});

// productSchema.pre('validate', function(next) {
//     const { error } = productValidator.validate(this);
//     if (error) {
//         this.invalidate('product', error.details[0].message);
//         return next(error);
//     }
//     next();
// })

const productModel = model<IProduct>("Product", productSchema);

export {productModel, productValidator};
export default productModel;