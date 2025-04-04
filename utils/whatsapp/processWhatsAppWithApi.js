import { sendFlow_1ToAdmin } from "../../flows/sendFlow_1ToAdmin.js";
import { adminWhatsAppNotification } from "../notifications/adminWhatsAppNotification.js";
import { handleWhatsappMessage } from "./handleWhatsappMessage.js";
import dotenv from "dotenv"

dotenv.config();
const adminPhone = process.env.ADMIN_PHONE;

export const processWhatsAppWithApi = async (userMessage) => {
	//console.log("usermessage en processWhatsAppWithApi", userMessage)
	let log;
	let message;

	try {
			// Si es el ADMIN
			if (userMessage.userPhone === adminPhone){
				console.log("detecte el admin phone")
				// Avizar al Admin que entre en su celular
				message = `🔔 *Notificación:*\n\n👋 Hola Administrador, por favor entre en su celular para ver el Menú de opciones disponibles.\n\n*Cámara de Concesionarios Stellantis*`
				
				await handleWhatsappMessage(userMessage.userPhone, message)

				// Envío Flow1 al Admin
				const wamId_Flow1 = await sendFlow_1ToAdmin(userMessage);
				
				// Agrego el wamId al objeto userMessage para traquear status FLOW1
				userMessage.wamId_Flow1 = wamId_Flow1;
				log = `1-Se envió el Flow1 al Administrador.`;

			} else {
				// NO es el ADMIN
				
				// Buscar en la Base de Concesionarios
				
				// Si el teléfono se encuentra se envía el Flow del Concesionario
				
				// Si el teléfono no está en la Base se notifica que no puede entrar
				message = `🔔 *Notificación:*\n\nEstimado ${userMessage.name}, su teléfono no se encuentra en la Base de Datos. Si considera utilizarlo, por favor solicite a alguien autorizado del Concesionario al que pertenece para darlo de alta. Muchas gracias.\n\n*Cámara de Concesionarios Stellantis*`

				await handleWhatsappMessage(userMessage.userPhone, message)

				// Se le da aviso al Admin de que alguien no está dado de alta.
				const adminMessage = `🔔 *Notificación:*\n\nEl usuario ${userMessage.name} con celular ${userMessage.userPhone}, quizo usar el Servicio y no está en la Base de Datos.\n\n*Cámara de Concesionarios Stellantis*`
				
				await adminWhatsAppNotification(adminPhone, adminMessage)
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
