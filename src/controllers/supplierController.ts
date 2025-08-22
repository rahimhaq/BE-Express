import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma";
import { AppError } from "../utils/AppError";

type StockDelta = { supplierId: number; productId: number; delta: number };

export const batchUpdateSupplierStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = req.body as StockDelta[];
    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError("Body harus array of { supplierId, productId, delta }", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Kumpulkan ID unik
      const supplierIds = Array.from(new Set(items.map(i => i.supplierId)));
      const productIds  = Array.from(new Set(items.map(i => i.productId)));

      // Cek eksistensi supplier & product
      const [suppliers, products] = await Promise.all([
        tx.supplier.findMany({ where: { id: { in: supplierIds } }, select: { id: true } }),
        tx.product.findMany({ where: { id: { in: productIds } },  select: { id: true } }),
      ]);
      const supplierSet = new Set(suppliers.map(s => s.id));
      const productSet  = new Set(products.map(p => p.id));

      for (const i of items) {
        if (!supplierSet.has(i.supplierId)) throw new AppError(`Supplier ${i.supplierId} tidak ditemukan`, 404);
        if (!productSet.has(i.productId))   throw new AppError(`Product ${i.productId} tidak ditemukan`, 404);
      }

      // Ambil baris SupplierProduct untuk semua pasangan unik
      const pairKeys = Array.from(new Set(items.map(i => `${i.supplierId}-${i.productId}`)));
      const pairs = pairKeys.map(k => {
        const [sid, pid] = k.split("-").map(Number);
        return { supplierId: sid, productId: pid };
      });

      const rows = await tx.supplierProduct.findMany({ where: { OR: pairs } });
      const rowMap = new Map(rows.map(r => [`${r.supplierId}-${r.productId}`, r]));

      // Hitung stok baru & validasi tidak negatif
      const updates = [];
      for (const it of items) {
        const key = `${it.supplierId}-${it.productId}`;
        const row = rowMap.get(key);
        if (!row) throw new AppError(`Baris stok supplierId=${it.supplierId}, productId=${it.productId} tidak ditemukan`, 404);

        const newStock = row.stock + Number(it.delta || 0);
        if (newStock < 0) throw new AppError(`Stok tidak valid (hasil negatif) untuk supplier=${it.supplierId}, product=${it.productId}`, 400);

        updates.push(
          tx.supplierProduct.update({ where: { id: row.id }, data: { stock: newStock } })
        );
      }

      return Promise.all(updates);
    });

    res.json({ success: true, message: "Batch update stok supplier berhasil", data: result });
  } catch (err) {
    next(err);
  }
};
