import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/connectdb.js";
import userRoutes from "./src/routes/userRoutes.js";
dotenv.config();
const PORT = process.env.PORT;
const app = express();
const DATABASE_URL = process.env.DATABASE_URL;
connectDB(DATABASE_URL);

app.use(express.json());

app.use("/api/user", userRoutes);

app.use(cors());

app.listen(PORT, () => {
  console.log(`server start at http//:localhost:${PORT}`);
});
