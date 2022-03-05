import { Router } from "express";
import {
  createCategory,
  getCategory,
} from "../controllers/categoryController.js";
import validateSchemaMiddleware from "../middlewares/validateSchemaMiddleware.js";
import categorySchema from "../schemas/categorySchema.js";

const categoryRouter = Router();

categoryRouter.get("/categories", getCategory);
categoryRouter.post(
  "/categories",
  validateSchemaMiddleware(categorySchema),
  createCategory
);

export default categoryRouter;
