import { Router } from "express";
import { transferPoints } from "../controllers/transactionController";

const router = Router();
router.post("/transfer-points", transferPoints);

export default router;
