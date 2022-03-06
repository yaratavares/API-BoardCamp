import { Router } from "express";
import {
  createClient,
  getClient,
  getClients,
  updateClient,
} from "../controllers/clientController.js";
import validateSchemaMiddleware from "../middlewares/validateSchemaMiddleware.js";
import clientSchema from "../schemas/clientSchema.js";

const clientRouter = Router();

clientRouter.get("/customers", getClients);
clientRouter.get("/customers/:id", getClient);
clientRouter.post(
  "/customers",
  validateSchemaMiddleware(clientSchema),
  createClient
);
clientRouter.put(
  "/customers/:id",
  validateSchemaMiddleware(clientSchema),
  updateClient
);

export default clientRouter;
