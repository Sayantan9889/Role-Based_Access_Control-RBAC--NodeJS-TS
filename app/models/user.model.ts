import { Model, Schema, model } from "mongoose";
import { object, ObjectSchema, string, boolean } from "joi";

interface IUser {
    image: string;
    name: string;
    email: string;
    password: string;
    role?: 'admin'|'manager'|'employee';
    isVarified: boolean;
}

const userValidator: ObjectSchema<IUser> = object({
    image: string().required(),
    name: string().required(),
    email: string().email().required(),
    password: string().min(8).required(),
    role: string().valid('admin', 'manager', 'employee').optional(),
    isVarified: boolean().default(false)
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
    },
    isVarified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true, versionKey: false });

const userModel: Model<IUser> = model('User', userSchema);

export { userModel, userValidator };
export default userModel;