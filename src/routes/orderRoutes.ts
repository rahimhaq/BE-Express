import { Router } from "express";
import { ordersSummary } from "../controllers/orderController";

const router = Router();

router.get("/summary", ordersSummary); // grouping + pagination (+minCount)

export default router;
