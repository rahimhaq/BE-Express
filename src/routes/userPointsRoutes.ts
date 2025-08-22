import { Router } from "express";
import { getUser, addPoints } from "../controllers/userPointsController";

const router = Router();
router.get("/:id", getUser);             // GET /api/users/:id  -> lihat saldo poin
router.patch("/:id/points", addPoints);  // PATCH /api/users/:id/points  -> top up poin

export default router;
