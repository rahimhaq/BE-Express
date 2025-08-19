import { Request, Response } from "express";
import { OrderModel, OrderItem, OrderStatus } from "../models/order";

export const listOrders = (_: Request, res: Response) => {
  const data = OrderModel.findAll();
  res.json({ success: true, count: data.length, data });
};

export const getOrder = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });

  const o = OrderModel.findById(id);
  if (!o) return res.status(404).json({ success: false, message: "Order not found" });

  res.json({ success: true, data: o });
};

export const createOrder = (req: Request, res: Response) => {
  const { items, status } = req.body as { items: OrderItem[]; status?: OrderStatus };

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "items harus array minimal 1 item" });
  }
  const invalid = items.some(i => typeof i.productId !== "number" || typeof i.quantity !== "number" || i.quantity <= 0);
  if (invalid) return res.status(400).json({ success: false, message: "Setiap item wajib {productId:number, quantity:number>0}" });

  const result = OrderModel.create({ items, status });
  if (result === "NOT_FOUND") return res.status(404).json({ success: false, message: "Ada productId yang tidak ditemukan" });
  if (result === "OUT_OF_STOCK") return res.status(409).json({ success: false, message: "Stok tidak mencukupi" });

  res.status(201).json({ success: true, data: result });
};

export const updateOrder = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });

  const { items, status } = req.body as { items?: OrderItem[]; status?: OrderStatus };

  const result = OrderModel.update(id, { items, status });
  if (result === "NOT_FOUND") return res.status(404).json({ success: false, message: "Order atau product tidak ditemukan" });
  if (result === "OUT_OF_STOCK") return res.status(409).json({ success: false, message: "Stok tidak mencukupi" });

  res.json({ success: true, data: result });
};

export const deleteOrder = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });

  const ok = OrderModel.delete(id);
  if (!ok) return res.status(404).json({ success: false, message: "Order not found" });

  res.json({ success: true, message: "Order deleted" });
};
