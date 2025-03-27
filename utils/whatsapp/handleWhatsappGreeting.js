import axios from "axios";
import { greeting } from "../notifications/greeting.js";

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

// Function that sends greeting to WhatsApp user
export const handleWhatsappGreeting = async (name, userPhone) => {
	try {
		// Posts the message to Whatsapp
		const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;
		const data = {
			messaging_product: "whatsapp",
			recipient_type: "individual",
			to: userPhone,
			type: "text",
			text: {
				preview_url: true,
				body: `¡Hola ${name}${greeting}`,
			},
		};

		const response = await axios
			.post(url, data, {
				headers: {
					"Content-Type": "application/json",
				},
			})			
			.catch((error) => {
				console.error(
					"Error enviando a Facebook en handleWhatsappGreeting.js----->",
					error.response ? error.response.data : error.message
				);
			});
	} catch (error) {
		console.log("Error en handleWhatsappGreeting.js--->", error.message);
		throw error;
	}
};
