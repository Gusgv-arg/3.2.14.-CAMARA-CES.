import { sendFlow_1ToAdmin } from "../../flows/sendFlow_1ToAdmin.js";
import { adminWhatsAppNotification } from "../notifications/adminWhatsAppNotification.js";
import { handleWhatsappMessage } from "./handleWhatsappMessage.js";
import Dealers from "../../models/dealers.js";
import dotenv from "dotenv";
import { sendFlow_2ToDealer } from "../../flows/sendFlow_2ToDealer.js";
import { getMediaWhatsappUrl } from "../media/getMediaWhatsappUrl.js";
import { downloadWhatsAppMedia } from "../media/downloadWhatsAppMedia.js";
import { abmDealers } from "../excel/abmDealers.js";

dotenv.config();
const adminPhone = process.env.ADMIN_PHONE;

export const processWhatsAppWithApi = async (userMessage) => {
	//console.log("usermessage en processWhatsAppWithApi", userMessage)
	let log;
	let message;

	try {
		// Si es el ADMIN
		if (userMessage.userPhone === adminPhone) {
			console.log("detecte el admin phone");
			if (userMessage.type !== "document") {
				// Avizar al Admin que entre en su celular
				message = `🔔 *Notificación:*\n\n☰ ¡👋 Hola Administrador! Por favor entre en su celular para ver el Menú de Opciones.\n\n*Cámara de Concesionarios Stellantis*`;

				await handleWhatsappMessage(userMessage.userPhone, message);

				// Envío Flow1 al Admin
				const wamId_Flow1 = await sendFlow_1ToAdmin(userMessage);

				// Agrego el wamId al objeto userMessage para traquear status FLOW1
				userMessage.wamId_Flow1 = wamId_Flow1;
				log = `1-Se envió el Flow1 al Administrador.`;
			
			} else if (userMessage.type === "document") {
				// Opción de ABM Concesionarios / personal
				console.log("entre al if de document del Admin");
				
				// Buscar la URL de WhatsApp
				const document = await getMediaWhatsappUrl(userMessage.documentId);
				const documentUrl = document.data.url;

				// Bajar el documento de WhatsApp
				const documentBuffer = await downloadWhatsAppMedia(documentUrl);
				const documentBufferData = documentBuffer.data;

				// Función de ABM de Concesionarios y Personal
				const phonesAndMailsToCheck = await abmDealers(documentBufferData);
				console.log("phonesAndMailsToCheck", phonesAndMailsToCheck);

				// Llamar a la función que verifica los teléfonos y correos
				
				log = `1-Se procesó el Excel de ABM de Concesionarios y Personal.`;	
			}

		} else {
			// NO es el ADMIN, busca en la Base de Concesionarios
			const dealer = await Dealers.findOne({
				isActive: true,
				employees: {
					$elemMatch: {
						phone: userMessage.userPhone,
						isActive: true,
					},
				},
			});

			if (dealer) {
				// Si está OK se envía el Flow del Concesionario
				message = `🔔 *Notificación:*\n\n☰ Estimado ${userMessage.name}, por favor entre en su celular para ver el Menú de Opciones de Concesionarios.\n\n*Cámara de Concesionarios Stellantis*`;

				await handleWhatsappMessage(userMessage.userPhone, message);

				// Envío Flow de Concesionario
				await sendFlow_2ToDealer(userMessage);

				log = `1-Se envió el Flow de Concesionario al usuario ${userMessage.name} con celular ${userMessage.userPhone}.`;
			} else {
				// Si NO esta ok se notifica que no puede entrar
				message = `🔔 *Notificación:*\n\n❗ Estimado ${userMessage.name}, su teléfono no se encuentra en la Base de Datos. Si considera que debe utilizar este servicio, por favor solicite a alguien autorizado del Concesionario al que pertenece para darlo de alta. Muchas gracias.\n\n*Cámara de Concesionarios Stellantis*`;

				await handleWhatsappMessage(userMessage.userPhone, message);

				// Se le da aviso al Admin de que alguien no está dado de alta.
				const adminMessage = `🔔 *Notificación:*\n\nEl usuario ${userMessage.name} con celular ${userMessage.userPhone}, quizo usar el Servicio y no está en la Base de Datos.\n\n*Cámara de Concesionarios Stellantis*`;

				await adminWhatsAppNotification(adminPhone, adminMessage);

				log = `1-Se envió el mensaje al usuario ${userMessage.name} con celular ${userMessage.userPhone} de que no está dado de alta en la base.`;
			}
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
