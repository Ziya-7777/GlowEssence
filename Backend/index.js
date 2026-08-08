import express from "express";
import "dotenv/config";
import db from "./configs/db.js";
import bodyParser from "body-parser";
import router from "./routes/index.js";
import connectDB from "./configs/db.js";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        // my vercel link
    ]
}));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "GlowEssence backend is running.",
    });
});

app.use("/api", router);

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();