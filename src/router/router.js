import { Router } from "express";
import categoryRouter from "./categoryRouter.js";

const router = Router();

router.use(categoryRouter);

export default router;
