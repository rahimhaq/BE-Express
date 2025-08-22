import { Router } from "express";
import { batchUpdateSupplierStock } from "../controllers/supplierController";

const router = Router();
// body: [{ supplierId, productId, delta }, ...]
router.post("/stock", batchUpdateSupplierStock);

export default router;
