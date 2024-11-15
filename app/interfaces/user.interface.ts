export interface IUser {
    image: string;
    name: string;
    email: string;
    password: string;
    role?: 'admin'|'manager'|'employee';
    isVarified: boolean;
    isActive: boolean;
    confirmPassword?: string;
    _id?: string;
    id?: string;
}