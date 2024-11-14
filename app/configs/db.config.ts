import mongoose from "mongoose";

export const connectDB = () => {
    const mongodb_uri:string = process.env.MONGODB_URI || "";
    
    mongoose.connect(mongodb_uri);

    mongoose.connection.on("connected", () => console.log("MongoDB connected successfully... 🎉"));

    mongoose.connection.on("disconnected", () => console.log("MongoDB disconnected... 😣"));

    mongoose.connection.on("error", (err: any) => console.error("Error while connecting MongoDB... 😢", err));
}