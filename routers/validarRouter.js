import express from "express";
import { validarController } from "../controllers/validarController.js";

const validarRouter = express.Router();

validarRouter.post("/", validarController); 

export default validarRouter;
