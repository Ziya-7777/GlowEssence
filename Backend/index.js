import express from "express";
import "dotenv/config";
import cors from "cors";
import db from "./configs/db.js";
import bodyParser from "body-parser";
import router from "./routes/index.js";
import razorpay from "./configs/razorpay.js";

const port = process.env.PORT || 3000;

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        // my vercel link
    ]
}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    return res.status(200).json({ message: "Server started." })
})

app.use('/api', router)

app.listen(port, (error) => {
    if (error) {
        console.log(error);
        return;
    }

    console.log("server started.");
    console.log(`http://localhost:${port}`);
})