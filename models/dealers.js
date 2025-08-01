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
			"Calidad y Formación",
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
	brands: [{
        type: String,
        enum: ["Fiat", "Peugeot", "Citroen", "Jeep_Ram"]
    }],
	profile: {
		type: String,
		enum: [
			"accionista_sa",
			"presidente_sa",
			"socio_srl",
			"socio_gerente_srl",
			"gerente_general",
			"ventas",
			"plan_de_ahorro",
			"postventa",
			"administración",
			"calidad_y_formación",
			"administrador_sistema",
			"grupo_general",
			"grupo_ventas",
			"grupo_planes",
			"grupo_postventa",
			"grupo_calidad",
			"asociación_admin",
			"asociación_abogado",
		],
	},
	phone: String,
	phoneOk: {
		type: String,
		enum: ["OK", "NOK", "Sin_Verificar", "Error en la verificación"],
		default: "Sin_Verificar",
		required: true,
	},
	mail: String,
	mailOk: {
		type: String,
		enum: ["OK", "NOK", "Sin_Verificar", "Error en la verificación"],
		default: "Sin_Verificar",
		required: true,
	},
	isActive: { type: String, enum: ["SI", "NO"], default: "SI", required: true },
	presidentMandate: {
		type: String,
		default: null,
	},
	docs: [documentSchema],
});

const dealerSchema = new mongoose.Schema({
	name: { 
        type: String,
        unique: true,  
        required: true 
    },
	legal_form: {
		type: String,
		enum: ["S.A.", "S.R.L.", "S.A.C.I.F.I.A.G. Y M.", "S.A.C.I.F.I.", "S.A.C.I.F."],
		default: "S.A.",
	},
	group_name: String,
	fantasy_name: String,	
	brands: [{
        type: String,
        enum: ["Fiat", "Peugeot", "Citroen", "Jeep_Ram"]
    }],	
	isActive: { type: String, enum: ["SI", "NO"], default: "SI", required: true },
	employees: [employeeSchema],
});

const Dealers = mongoose.model("Dealers", dealerSchema);

export default Dealers;
