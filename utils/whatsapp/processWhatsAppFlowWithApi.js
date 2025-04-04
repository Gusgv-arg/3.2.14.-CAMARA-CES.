import axios from "axios";
import { handleWhatsappMessage } from "../whatsapp/handleWhatsappMessage.js";
import { adminWhatsAppNotification } from "../notifications/adminWhatsAppNotification.js";

export const processWhatsAppFlowWithApi = async (userMessage) => {
	const type = userMessage.type;
	let log;

	try {
		if (type === "interactive") {
			// ---- TOKEN 1 -------------------------------------//
			if (userMessage.message.includes('"flow_token":"1"')) {
				if (userMessage.message.includes('"Base_Concesionarios_en_Excel"')) {
					console.log("entre al 2 if");
					const message = `🔔 *Notificación:*\n\nEn breve recibirá un Excel con todos los Concesionarios.\n\n*Cámara de Concesionarios Stellantis*`;

					// Notifica al Admin con la opción elegida
					await adminWhatsAppNotification(userMessage.userPhone, message);
					// Llama a la función que genera el Excel

					// Envía el Excel al Admin

					log =
						"1. Se notificó al Admin que recibirá un Excel con los concesionarios. 2. Se le envió el Excel por WhatsApp.";

				} else if (userMessage.message.includes('"Envio_de_Comunicacion"')) {
					const message = `🔔 *Notificación:*\n\nPor favor entre en su celular para completar el proceso de envío de una Comunicación.\n\n*Cámara de Concesionarios Stellantis*`;

					// Notifica al Admin con la opción elegida
					await adminWhatsAppNotification(userMessage.userPhone, message);

					// Envía el Flow de Comunicación

					log =
						"1. Se notificó al Admin que recibirá el Flow de Comunicación. 2. Se le envió el Flow de Comunicación por WhatsApp.";
						
				} else if (userMessage.message.includes('"Envio_de_Encuesta"')) {
					const message = `🔔 *Notificación:*\n\nPor favor entre en su celular para completar el proceso de envío de Encuesta.\n\n*Cámara de Concesionarios Stellantis*`;

					// Notifica al Admin con la opción elegida
					await adminWhatsAppNotification(userMessage.userPhone, message);

					// Envía el Flow de Encuesta
					log =
						"1. Se notificó al Admin que recibirá el Flow de Encuesta. 2. Se le envió el Flow de Encuesta por WhatsApp.";
				}

				return log;
			} else if (/\"flow_token\":\"2/.test(userMessage.message)) {
				// ---- TOKEN 2 -------------------------------------//

				log = `1-`;
			}
		}
	} catch (error) {
		//console.log("error en processWhatsAppFlowWithApi.js", error)

		let errorMessage;

		errorMessage = error?.response?.data
			? JSON.stringify(error.response.data)
			: error.message;

		throw errorMessage;
	}
};
