import express from "express";
import cors from "cors";

import productRoutes from "./routes/productRoutes";         // (dari hari sebelumnya)
import orderRoutes from "./routes/orderRoutes";             // (dari hari sebelumnya)
import postPrismaRoutes from "./routes/postPrismaRoutes";   // (dari hari sebelumnya)

import transactionRoutes from "./routes/transactionRoutes"; // ← hari-4 CP1
import supplierRoutes from "./routes/supplierRoutes";       // ← hari-4 CP2
import userPointsRoutes from "./routes/userPointsRoutes";

import { errorHandler } from "./middlewares/errorHandler";

const app = express();
app.use(cors());
app.use(express.json());

// healthcheck
app.get("/", (_req, res) => res.json({ message: "API up ✅" }));

// existing mounts
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/posts", postPrismaRoutes);

// day-4 mounts
app.use("/api", transactionRoutes);            // /api/transfer-points
app.use("/api/suppliers", supplierRoutes);     // /api/suppliers/stock
app.use("/api/users", userPointsRoutes);

// error middleware (HARUS terakhir)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
