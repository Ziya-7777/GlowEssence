import mongoose from "mongoose";
import dns from "node:dns";

// Set the DNS servers for MongoDB Atlas connection
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const db = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
};

export default db;