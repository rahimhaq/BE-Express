import { Router } from "express";
import { register, login, createPasswordResetToken } from "../controllers/authUserController";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/password-reset", createPasswordResetToken);

router.get("/me", requireAuth, (req, res) => res.json({ success: true, user: req.user }));
router.get("/admin-only", requireAuth, requireRole("ADMIN"), (_req, res) => res.json({ ok: true }));

export default router;
