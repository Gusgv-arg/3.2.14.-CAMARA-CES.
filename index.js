import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import testingRouter from "./routers/testingRouter.js";
import whatsappRouter from "./routers/whatsappRouter.js";
import path from 'path';
import { fileURLToPath } from "url";
import validarRouter from "./routers/validarRouter.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => {
		console.log("Connected to Database:", mongoose.connection.db.databaseName);
	})
	.catch((err) => {
		console.log(err.message);
	});

const app = express();

app.use(
	cors({
		origin: ["*", "http://localhost:3000"],
		credentials: true,
	})
);
app.use(express.json());
app.use(morgan("dev"));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use("/webhook", whatsappRouter);
app.use("/validar_whatsapp", validarRouter);
app.use("/testing", testingRouter);

const port = process.env.PORT || 80

app.listen(port, () => {
	console.log(`Server running at ${process.env.NODE_ENV === 'production' ? 'https://three-2-14-camara-ces.onrender.com' : `http://localhost:${port}`}`);
});
