import express from "express";
import { config } from "dotenv";
import connectDB from "./config/db.js";
import productRoutes from "./router/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import morgan from "morgan";

config();
connectDB();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.use("/api/product", productRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server Running On Port: ${PORT}`);
});
