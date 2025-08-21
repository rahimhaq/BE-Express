import express from "express";
import cors from "cors";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import postPrismaRoutes from "./routes/postPrismaRoutes";

const app = express();
app.use(cors());
app.use(express.json());

// Healthcheck
app.get("/", (_req, res) => res.json({ message: "API up ✅" }));

// Mount routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/posts", postPrismaRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
