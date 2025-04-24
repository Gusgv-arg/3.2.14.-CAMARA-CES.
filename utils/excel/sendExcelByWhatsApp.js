import axios from "axios";
import { adminWhatsAppNotification } from "../notifications/adminWhatsAppNotification.js";

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

export const sendExcelByWhatsApp = async (userPhone, fileUrl, fileName) => {
	try {
		// Posts the message to Whatsapp
		const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;
		const data = {
			messaging_product: "whatsapp",
			recipient_type: "individual",
			to: userPhone,
			type: "document",
			document: {
				link: fileUrl,
				filename: fileName,
			},
		};

		const response = await axios
			.post(url, data, {
				headers: {
					"Content-Type": "application/json",
				},
			})
		
	} catch (error) {
		console.log(
			"Error in sendExcelByWhatsApp.js:",
			error.response ? error.response.data : error.message
		);
		const errorMessage = `🔔 *NOTIFICACION DE ERROR:*\nHay un problema enviando el Excel ${fileName} por WhatsApp: ${
			error.response ? error.response.data : error.message
		}`;
		
		adminWhatsAppNotification(userPhone, errorMessage);
	}
};
