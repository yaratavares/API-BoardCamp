import { Router } from "express";
import { createRental, getRentals } from "../controllers/rentalControllerCR.js";
import {
  deleteRental,
  finishRental,
} from "../controllers/rentalControllerUD.js";
import validateSchemaMiddleware from "../middlewares/validateSchemaMiddleware.js";
import rentalSchema from "../schemas/rentalSchema.js";

const rentalRouter = Router();

rentalRouter.get("/rentals", getRentals);
rentalRouter.post(
  "/rentals",
  validateSchemaMiddleware(rentalSchema),
  createRental
);
rentalRouter.post("/rentals/:id/return", finishRental);
rentalRouter.delete("/rentals/:id", deleteRental);

export default rentalRouter;
