import { Model, Schema, model } from "mongoose";
import joi, { ObjectSchema } from "joi";
import { IUser } from "../interfaces/user.interface";


const userValidator: ObjectSchema<IUser> = joi.object({
    image: joi.string().required(),
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(8).required(),
    role: joi.string(), //.valid('admin', 'manager', 'employee').optional(),
    isVarified: joi.boolean().default(false),
    isActive: joi.boolean().default(false)
});

const userSchema: Schema<IUser> = new Schema({
    image: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'employee'],
        default: 'employee'
    },
    isVarified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, { timestamps: true, versionKey: false });

const userModel: Model<IUser> = model('User', userSchema);

export { userModel, userValidator };
export default userModel;