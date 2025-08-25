import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err?.code === "P2025") {
    return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
  }
  if (err?.name === "ZodError") {
    const first = err.issues?.[0]?.message || "Invalid input";
    return res.status(400).json({ success: false, message: first });
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({ success: false, message: err.message });
  }
  console.error("Unhandled Error:", err);
  return res.status(500).json({ success: false, message: "Internal server error" });
}
