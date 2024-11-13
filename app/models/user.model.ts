import { Model, Schema, model } from "mongoose";
import { object, ObjectSchema, string } from "joi";

interface IUser {
    _id: Schema.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    role?: string;
}

const userValidator: ObjectSchema<IUser> = object({
    name: string().required(),
    email: string().email().required(),
    password: string().min(8).required(),
    role: string().valid('admin', 'manager', 'employee').optional()
});

const userSchema: Schema<IUser> = new Schema({
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
}, { timestamps: true, versionKey: false });

const userModel: Model<IUser> = model('User', userSchema);

export { userModel, userValidator };
export default userModel;