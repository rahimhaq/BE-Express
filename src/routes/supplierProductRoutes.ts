import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { myProducts, addProductForSupplier } from "../controllers/supplierProductController";

const router = Router();
router.get("/suppliers/products", requireAuth, myProducts);
router.post("/products/add", requireAuth, addProductForSupplier);

export default router;
