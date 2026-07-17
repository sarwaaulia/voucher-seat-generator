import express from "express";
import { checkVoucher, generateVoucher } from "../controllers/voucher.controller";

const router = express.Router()

router.post("/check", checkVoucher);
router.post("/generate", generateVoucher)

export default router;