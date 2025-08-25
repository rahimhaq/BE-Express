import { Router } from "express";
import { supplierRegister, supplierLogin } from "../controllers/authSupplierController";

const router = Router();
router.post("/register", supplierRegister);
router.post("/login", supplierLogin);

export default router;
