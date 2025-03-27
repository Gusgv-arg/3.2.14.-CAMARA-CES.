import express from "express";
import { testingController } from "../controllers/testingController.js";

const testingRouter = express.Router();

testingRouter.post("/", testingController)

export default testingRouter