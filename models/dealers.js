import mongoose from "mongoose";

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
	docStatusDate: {type: Date, default: Date.now},
});

const employeeSchema = new mongoose.Schema({
	empName: String,
	profile: 
		{
			type: String,
			enum: [
				"Accionista",
				"General",
				"Ventas",
				"Postventa",
				"Planes",
				"Administración",
				"Calidad",
			],
		},	
	phone: String,
	mail: String,
	isActive: Boolean,
	docs: [documentSchema],
});

const dealerSchema = new mongoose.Schema({
	brand: {
		type: String,
		required: true,
		enum: ["Peugeot", "Citroen", "DS", "Fiat", "Jeep", "Ram"],
	},
	name: String,
	code: String,
	address: String,
	province: String,
	cuit: String,
	isActive: Boolean,
	employees: [employeeSchema],
});

const Dealers = mongoose.model("Dealers", dealerSchema);

export default Dealers;
