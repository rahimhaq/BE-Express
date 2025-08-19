import { Request, Response } from "express";
import { ProductModel } from "../models/product";
import { OrderModel } from "../models/order";

export const listProducts = (_: Request, res: Response) => {
  const data = ProductModel.findAll();
  res.json({ success: true, count: data.length, data });
};

export const getProduct = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });

  const p = ProductModel.findById(id);
  if (!p) return res.status(404).json({ success: false, message: "Product not found" });

  res.json({ success: true, data: p });
};

export const createProduct = (req: Request, res: Response) => {
  const { name, price, stock } = req.body || {};
  if (!name || typeof price !== "number" || typeof stock !== "number") {
    return res.status(400).json({ success: false, message: "name, price:number, stock:number wajib" });
  }
  const p = ProductModel.create({ name, price, stock });
  res.status(201).json({ success: true, data: p });
};

export const updateProduct = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });

  const { name, price, stock } = req.body || {};
  const p = ProductModel.update(id, { name, price, stock });
  if (!p) return res.status(404).json({ success: false, message: "Product not found" });

  res.json({ success: true, data: p });
};

export const deleteProduct = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });

  if (OrderModel.isProductReferenced(id)) {
    return res.status(409).json({ success: false, message: "Product digunakan pada order, tidak bisa dihapus" });
  }

  const ok = ProductModel.delete(id);
  if (!ok) return res.status(404).json({ success: false, message: "Product not found" });
  res.json({ success: true, message: "Product deleted" });
};
