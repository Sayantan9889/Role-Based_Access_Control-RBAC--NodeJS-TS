import { connect } from "mongoose";

export const connectDB = () => {
    const mongodb_uri:string = process.env.MONGODB_URI || "";
    
    connect(mongodb_uri).then((res) => {
        console.log('Database connected successfully... 🎉');
    }).catch((err) => {
        console.log('Error while connecting database... 😢', err);
    });

    // connection.on("connected", () => console.log("MongoDB connected successfully... 🎉"));

    // connection.on("disconnected", () => console.log("MongoDB disconnected... 😣"));

    // connection.on("error", (err: any) => console.error("Error while connecting MongoDB... 😢", err));
}