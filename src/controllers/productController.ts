import { Request, Response } from "express";
import { prisma } from "../prisma";

/**
 * GET /api/products
 * Filtering: minPrice, maxPrice, minStock, maxStock
 * Sorting: sortBy (price|stock|createdAt), order (asc|desc)
 * Pagination: limit, offset
 */
export const listProducts = async (req: Request, res: Response) => {
  const {
    minPrice, maxPrice, minStock, maxStock,
    sortBy, order, limit, offset
  } = req.query as Record<string, string>;

  const where: any = {};
  if (minPrice || maxPrice) {
    where.price = {
      ...(minPrice ? { gte: Number(minPrice) } : {}),
      ...(maxPrice ? { lte: Number(maxPrice) } : {}),
    };
  }
  if (minStock || maxStock) {
    where.stock = {
      ...(minStock ? { gte: Number(minStock) } : {}),
      ...(maxStock ? { lte: Number(maxStock) } : {}),
    };
  }

  const take = Math.min(Number(limit ?? 10), 100);
  const skip = Number(offset ?? 0);
  const allowedSort = ["price", "stock", "createdAt"];
  const sortField = allowedSort.includes(String(sortBy)) ? String(sortBy) : "createdAt";
  const sortOrder: "asc" | "desc" = (order === "asc" || order === "desc") ? order : "desc";

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip, take,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ success: true, meta: { total, limit: take, offset: skip }, data });
};

// (CRUD dasar tetap ada agar tidak putus dependensi proyekmu)
export const getProduct = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return res.status(404).json({ success: false, message: "Product not found" });
  res.json({ success: true, data: p });
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, price, stock } = req.body || {};
  if (!name || typeof price !== "number" || typeof stock !== "number") {
    return res.status(400).json({ success: false, message: "name, price:number, stock:number wajib" });
  }
  const p = await prisma.product.create({ data: { name, price, stock } });
  res.status(201).json({ success: true, data: p });
};

export const updateProduct = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });
  const { name, price, stock } = req.body || {};
  try {
    const p = await prisma.product.update({
      where: { id },
      data: { name, price, stock }
    });
    res.json({ success: true, data: p });
  } catch {
    res.status(404).json({ success: false, message: "Product not found" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });
  try {
    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: "Product deleted" });
  } catch {
    res.status(404).json({ success: false, message: "Product not found" });
  }
};
