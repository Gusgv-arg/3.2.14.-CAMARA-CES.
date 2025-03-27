import { sendFlow_1ToLead } from "../../flows/sendFlow_1ToLead.js";
import Leads from "../../models/leads.js";
import BotSwitch from "../../models/botSwitch.js";
import { createLeadInDb } from "../dataBase/createLeadInDb.js";
import { saveNotificationInDb } from "../dataBase/saveNotificationInDb.js";
import { adminWhatsAppNotification } from "../notifications/adminWhatsAppNotification.js";
import { handleWhatsappMessage } from "./handleWhatsappMessage.js";

const myPhone = process.env.MY_PHONE;

export const processWhatsAppWithApi = async (userMessage) => {
	// Obtain current date and hour
	const currentDateTime = new Date().toLocaleString("es-AR", {
		timeZone: "America/Argentina/Buenos_Aires",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	let existingLead;
	let log;

	try {
		// Busca el Lead
		existingLead = await Leads.findOne({ id_user: userMessage.userPhone });

		// Lead NO EXISTE -----------------------------------------------------------
		if (!existingLead) {
			// Llama a la función para crear el Lead y guardar en BD
			existingLead = await createLeadInDb(userMessage);

			// Envía un mensaje previo de bienvenida xq no se ve el Flow
			const greeting = `👋 Hola ${userMessage.name}, bienvenido a Megamoto!\n\nPor favor completá el siguiente formulario con tu consulta *desde tu celular.*\n\n*¡Tu moto está más cerca en MEGAMOTO!*`;

			await handleWhatsappMessage(userMessage.userPhone, greeting);

			// Envía el Flow 1 al lead y me hago del wamId
			const wamId_Flow1 = await sendFlow_1ToLead(userMessage);

			// Agrego el wmId al objeto userMessage para traquear status FLOW1
			userMessage.wamId_Flow1 = wamId_Flow1;

			// Graba notificación al cliente en la BDs
			const notification = { message: greeting };
			await saveNotificationInDb(userMessage, notification);

			// Si la alarma está prendida notifica al Admin de un nuevo lead
			let botSwitch = await BotSwitch.findOne();

			if (botSwitch?.alarmSwitch === "ON") {
				const message = `*🔔 Notificación NUEVO LEAD:*\n\nAcaba de entrar un nuevo lead.\nNombre: ${userMessage.name}\n\nMegamoto`;
				await adminWhatsAppNotification(myPhone, message);
			}

			// Actualiza el log
			log = `1-Se creo el lead ${userMessage.name} en BD. 2-Se mandó saludo inicial. 3-Se mandó Flow 1. 4-Se grabó todo en BD. 5-Si la alarma esta en "ON" se notificó al admin.`;
			return log;
		} else {
			// -------- Lead YA EXISTE ------------------------------------------------------

			const lastFlow = existingLead.flows[existingLead.flows.length - 1];
			const lastFlowStatus = lastFlow.client_status;
			const lastFlowVendor = lastFlow.vendor_name;
			const lastFlowPhone = lastFlow.vendor_phone;

			let message;

			if (lastFlowStatus !== "compró" && lastFlowStatus !== "no compró") {
				// El Lead ya está en la Fila

				if (lastFlowVendor) {
					// El lead ya tiene un vendedor asignado

					message = `*🔔 Notificación Automática:*\n\n📣 Estimado ${userMessage.name}; le enviaremos tu consulta a tu vendedor asignado que te recordamos es ${lastFlowVendor} con el celular ${lastFlowPhone}.\n❗ Agendalo para identificarlo cuando te contacte.\n🙏 Te pedimos un poco de paciencia.\n¡Haremos lo posible para atenderte cuanto antes!\n\n*MEGAMOTO* `;

					// Envía notificación de recordatorio al Lead
					await handleWhatsappMessage(userMessage.userPhone, message);

					// Envía alarma al vendedor con la pregunta del cliente
					const alarm = `*🔔 Notificación Automática:*\n\n📣 El cliente ${userMessage.name} cel: ${userMessage.userPhone} envió el siguiente mensaje: ${userMessage.message}.\n\n*MEGAMOTO*`;

					await handleWhatsappMessage(lastFlowPhone, alarm);

					// Graba la pregunta del lead y notificación al mismo en la BDs
					lastFlow.messages += `\n${currentDateTime} ${userMessage.name}: ${
						userMessage.message
					}\n${currentDateTime} API: ${message.replace(/\n/g, " ")}`;
					await existingLead.save();

					// Actualiza el log
					log = `1-Se notificó al lead ${userMessage.name} recordando su vendedor. 2-Alarma al vendedor ${lastFlowVendor}. `;

					return log;
				} else {
					// El Lead NO tiene un vendedor asignado, pudo No haber enviado el Flow

					if (lastFlow.flow1Response === "si") {
						message = `*🔔 Notificación Automática:*\n\n📣 Estimado ${userMessage.name}; le estaremos enviando tu consulta a un vendedor. Haremos lo posible para asignarte uno cuando antes y te notificaremos con sus datos.\n\n*¡Tu moto está más cerca en MEGAMOTO!*`;
					} else {
						message = `*🔔 Notificación Automática:*\n\n📣 Estimado ${userMessage.name}; le estaremos enviando tu consulta a un vendedor. Haremos lo posible para asignarte uno cuando antes y te notificaremos con sus datos.\n\n❗ 🙏 Para una mejor atención te recordamos enviar el formulario con tu consulta. Revizá en el historial de conversaciones. ¡Muchas Gracias! \n\n*¡Tu moto está más cerca en MEGAMOTO!*`;
					}

					// Envía notificación al Lead
					await handleWhatsappMessage(userMessage.userPhone, message);

					// Graba la pregunta del lead y notificación al mismo en la base de datos
					lastFlow.messages += `\n${currentDateTime} ${userMessage.name}: ${
						userMessage.message
					}\n${currentDateTime} API: ${message.replace(/\n/g, " ")}`;
					await existingLead.save();

					// Actualiza el log
					log = `1-Se notificó al Lead ${userMessage.name} que aún no tiene un vendedor asignado. `;

					return log;

					//------- VER SI A FUTURO CREO UNA ALARMA EN ESTA INSTANCIA O ALGUN PROCESO ESPECIAL -------
				}
			} else {
				// Lead ya existe y NO tiene un Flow abierto arranca el proceso de 0.

				// Envía un mensaje previo de bienvenida x si no se ve el Flow
				const greeting2 = `👋 Hola nuevamente, gracias por seguir confiando en Megamoto!\n\n📣 Para atenderte mejor, vas a recibir otro mensaje el cual te pedimos que completes.\n\n*❗ Importante: entrá en tu celular para ver el segundo mensaje.* \n\n*¡Tu moto está más cerca en MEGAMOTO!*`;

				await handleWhatsappMessage(userMessage.userPhone, greeting2);

				// Envía el Flow 1 al lead y me hago del wamId
				const wamId_Flow1 = await sendFlow_1ToLead(userMessage);

				// Agrego el wmId al objeto userMessage para traquear status FLOW1
				userMessage.wamId_Flow1 = wamId_Flow1;

				// Graba notificación al cliente en la BDs
				const notification = { message: greeting2 };
				await saveNotificationInDb(userMessage, notification);

				// Si la alarma está prendida notifica al Admin de un nuevo lead
				let botSwitch = await BotSwitch.findOne();

				if (botSwitch?.alarmSwitch === "ON") {
					const message = `*🔔 Notificación NUEVO LEAD:*\n\nAcaba de entrar un nuevo lead.\nNombre: ${userMessage.name}\n\nMegamoto`;
					await adminWhatsAppNotification(myPhone, message);
				}

				// Actualiza el log
				log = `1-Se volvió a saludar al lead ${userMessage.name} ya que estaba en BD y no tenía un Flow abierto. 2-Se le envió Flow 1. 3-Se grabó en BD. 4-Si la alarma esta en "ON" se notificó al admin.`;

				return log;
			}
		}
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
