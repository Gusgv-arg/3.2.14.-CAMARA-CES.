import { sendFlow_1ToAdmin } from "../../flows/sendFlow_1ToAdmin.js";
import { handleWhatsappMessage } from "./handleWhatsappMessage.js";
import dotenv from "dotenv"

/*import { createLeadInDb } from "../dataBase/createLeadInDb.js";
import { saveNotificationInDb } from "../dataBase/saveNotificationInDb.js";
import { adminWhatsAppNotification } from "../notifications/adminWhatsAppNotification.js";
*/
dotenv.config();
const adminPhone = process.env.ADMIN_PHONE;

export const processWhatsAppWithApi = async (userMessage) => {
	console.log("usermessage en processWhatsAppWithApi", userMessage)
	let log;

	try {
			// Si el teléfono es del Admin envía Flow del Admin
			if (userMessage.userPhone === adminPhone){
				console.log("detecte el admin phone")
				// Avizar al Admin que entre en su celular
				const message = `🔔 *Notificación:*\n\nEstimado Administrador, debe entrar en su celular para ver el Menú de opciones disponibles.\n\n*Cámara Concesionarios Stellantis*`
				
				await handleWhatsappMessage(userMessage.userPhone, message)

				// Envío Flow1 al Admin
				const wamId_Flow1 = await sendFlow_1ToAdmin(userMessage);
				
				// Agrego el wamId al objeto userMessage para traquear status FLOW1
				userMessage.wamId_Flow1 = wamId_Flow1;
				log = `1-Se envió el Flow1 al Administrador.`;

			} else {
				// Si es otro teléfono envía el Flow del Concesionario
				console.log("Enviar el flow al concesionario")
			}


			return log;
		
	} catch (error) {
		console.error(
			"Error in processWhatsAppWithApi.js:",
			error?.response?.data
				? JSON.stringify(error.response.data)
				: error.message
		);

		const errorMessage = `Error en processWhatsAppWithApi.js: ${
			error?.response?.data
				? JSON.stringify(error.response.data)
				: error.message
		}`;

		throw errorMessage;
	}
};
