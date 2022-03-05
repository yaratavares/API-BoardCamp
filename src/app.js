import express, { json } from "express";
import cors from "cors";
import router from "./router/router.js";

const app = express();
app.use(cors());
app.use(json());

app.use(router);

app.listen(3000, () => {
  console.log("Listening on 3000");
});
