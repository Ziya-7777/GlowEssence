import mongoose from "mongoose"
import dns from "node:dns";

// Set the DNS server to use for MongoDB connection
dns.setServers(['1.1.1.1' , '1.0.0.1']);

const db = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);

        console.log("Database connected");

    } catch (error) {

        console.log(error.message);

    }
}

export default db();