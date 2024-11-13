import { Model, Schema, model } from "mongoose";
import {object, ObjectSchema, string} from "joi";

// Define user validation schema

const userValidator: ObjectSchema<any> = object({
    name: string().required(),
    email: string().email().required(),
    password: string().min(8).required(),
    role: string().valid('admin', 'manager', 'employee').optional()
});

const userSchema: Schema<any> = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'employee'],
        default: 'employee'
    }
}, { timestamps: true });

const userModel:Model<any> = model('User', userSchema);

export { userModel, userValidator };
export default userModel;