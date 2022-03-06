import { Router } from "express";
import categoryRouter from "./categoryRouter.js";
import gameRouter from "./gameRouter.js";

const router = Router();

router.use(categoryRouter);
router.use(gameRouter);

export default router;
