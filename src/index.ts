import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";

import authUserRoutes from "./routes/authUserRoutes";
import authSupplierRoutes from "./routes/authSupplierRoutes";
import supplierProductRoutes from "./routes/supplierProductRoutes";
import productOwnerRoutes from "./routes/productOwnerRoutes";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.json({ ok: true }));

app.use("/api", authUserRoutes);               // /register, /login, /password-reset, /me, /admin-only
app.use("/api/suppliers", authSupplierRoutes); // /register, /login (supplier)
app.use("/api", supplierProductRoutes);        // /suppliers/products, /products/add
app.use("/api", productOwnerRoutes);           // /products/:id (PATCH owner-only)

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API up on http://localhost:${PORT}`));
