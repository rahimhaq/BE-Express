import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma";
import { AppError } from "../utils/AppError";
import { z } from "zod";

// GET /suppliers/products
export const myProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== "SUPPLIER") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const prods = await prisma.supplierProduct.findMany({
      where: { supplier: { email: req.user.email } },
      include: { product: true }
    });
    res.json({ success: true, data: prods });
  } catch (e) { next(e); }
};

// POST /products/add
const addSchema = z.object({
  name: z.string().min(3),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative()
});

export const addProductForSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== "SUPPLIER") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const parsed = addSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(parsed.error.issues[0]?.message || "Invalid input", 400);
    const { name, price, stock } = parsed.data;

    const product = await prisma.product.create({ data: { name, price, stock } });
    const supplier = await prisma.supplier.findUnique({ where: { email: req.user.email } });
    if (!supplier) throw new AppError("Supplier tidak ditemukan", 404);
    await prisma.supplierProduct.create({
      data: { supplierId: supplier.id, productId: product.id, stock }
    });

    res.status(201).json({ success: true, data: product });
  } catch (e) { next(e); }
};
