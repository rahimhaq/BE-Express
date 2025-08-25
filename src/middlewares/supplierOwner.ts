import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma";

export async function requireSupplierOwnsProduct(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || req.user.role !== "SUPPLIER") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const productId = Number(req.params.id);
    if (Number.isNaN(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }
    const pair = await prisma.supplierProduct.findFirst({
      where: { productId, supplier: { email: req.user.email } },
      select: { id: true }
    });
    if (!pair) return res.status(403).json({ success: false, message: "Anda bukan pemilik product ini" });
    next();
  } catch (e) { next(e); }
}
