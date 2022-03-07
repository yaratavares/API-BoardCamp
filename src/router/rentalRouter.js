import { Router } from "express";
import {
  createRental,
  deleteRental,
  finishRental,
  getRentals,
} from "../controllers/rentalController.js";
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
