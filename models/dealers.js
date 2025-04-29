import mongoose from "mongoose";
import { type } from "os";

const documentSchema = new mongoose.Schema({
	docName: String,
	docType: { type: String, enum: ["Minuta", "Información", "Encuesta"] },
	docArea: {
		type: String,
		enum: [
			"General",
			"Ventas",
			"Postventa",
			"Planes",
			"Administración",
			"Calidad",
			"Red",
		],
	},
	channel: { type: String, enum: ["WhatsApp", "Mail"] },
	docStatus: {
		type: String,
		enum: ["Enviado", "Recibido", "Leído", "Error", "Respuesta"],
	},
	docCreationDate: { type: Date, default: Date.now },
	docStatusDate: { type: Date, default: Date.now },
});

const employeeSchema = new mongoose.Schema({
	empName: String,
	profile: {
		type: String,
		enum: [
			"Accionista",
			"Presidente",
			"Gerente General",
			"Ventas",
			"Postventa",
			"Planes",
			"Administración",
			"Calidad",
		],
	},
	phone: String,
	phoneOk: { type: String, enum: ["OK", "NOK", "Sin_Verificar"], default: "Sin_Verificar", required: true },
	mail: String,
	mailOk: { type: String, enum: ["OK", "NOK", "Sin_Verificar"], default: "Sin_Verificar", required: true },
	isActive: { type: String, enum: ["SI", "NO"], default: "SI", required: true },
	presidentMandate: {
		type: String,
		default: null,
	},
	docs: [documentSchema],
});

const dealerSchema = new mongoose.Schema({
	brand: {
		type: String,
		required: true,
		enum: ["Peugeot", "Citroen", "Fiat", "Jeep", "RAM"],
	},
	name: String,
	code: String,
	address: String,
	province: String,
	cuit: String,
	isActive: { type: String, enum: ["SI", "NO"], default: "SI", required: true },
	employees: [employeeSchema],
});

const Dealers = mongoose.model("Dealers", dealerSchema);

export default Dealers;
