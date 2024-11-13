import express, { Express } from "express";
import { connectDB } from "./app/configs/db.config";
import { json, urlencoded } from "body-parser";
import cors from "cors";
import { config } from "dotenv";
import { join } from "path";

// Initialize Express app
const app: Express = express();

// Load environment variables from.env file
config();

// Connect to MongoDB
connectDB();

// Middleware to parse JSON and URL-encoded data
app.use(json());
app.use(urlencoded({ extended: true }));

// Enable CORS for cross-origin requests
app.use(cors());

// static folder
app.use('/uploads', express.static(join(__dirname, 'uploads')))

const port = process.env.PORT || 9000;
app.listen(port, () => {
    console.log(`Server running on  http://localhost:${port}`);
});