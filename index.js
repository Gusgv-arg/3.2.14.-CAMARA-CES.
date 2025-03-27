import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import testingRouter from "./routers/testingRouter.js";
import whatsappRouter from "./routers/whatsappRouter.js";

dotenv.config();

/* mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => {
		console.log("Connected to DEALERS data base");
	})
	.catch((err) => {
		console.log(err.message);
	}); */

const app = express();

app.use(
	cors({
		origin: ["*", "http://localhost:3000"],
		credentials: true,
	})
);
app.use(express.json());
app.use(morgan("dev"));

app.use("/webhook", whatsappRouter);
app.use("/testing", testingRouter);

const port = process.env.PORT || 80

app.listen(port, () => {
	console.log(`Server running at ${process.env.NODE_ENV === 'production' ? 'https://three-2-10-megamoto-campania-whatsapp.onrender.com' : `http://localhost:${port}`}`);
});
