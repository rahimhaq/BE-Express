import { Request, Response } from "express";
import { prisma } from "../prisma";

export const listProducts = async (_: Request, res: Response) => {
  const data = await prisma.product.findMany({ orderBy: { id: "asc" } });
  res.json({ success: true, count: data.length, data });
};

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
