import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { requireSupplierOwnsProduct } from "../middlewares/supplierOwner";
import { prisma } from "../prisma";
import { z } from "zod";
import { AppError } from "../utils/AppError";

const router = Router();

const updSchema = z.object({
  name: z.string().min(3).optional(),
  price: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
});

router.patch("/products/:id", requireAuth, requireSupplierOwnsProduct, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const parsed = updSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.issues[0]?.message || "Invalid input", 400);
    const product = await prisma.product.update({ where: { id }, data: parsed.data });
    res.json({ success: true, data: product });
  } catch (e) { next(e); }
});

export default router;
