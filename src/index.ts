import express from "express";
import bodyParser from "body-parser";
import postRoutes from "./routes/postRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import userRoutes from "./routes/userRoutes";
import postPrismaRoutes from "./routes/postPrismaRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Healthcheck
app.get("/", (_, res) => res.json({ message: "API up ✅" }));

// Mount routes
app.use("/api/posts", postRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts-prisma", postPrismaRoutes);

// 404 fallback
app.use((_, res) => res.status(404).json({ success: false, message: "Not Found" }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
