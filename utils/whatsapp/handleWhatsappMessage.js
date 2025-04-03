import axios from "axios";
import dotenv from "dotenv"

dotenv.config()
const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

// Function that sends message to the user
export const handleWhatsappMessage = async (senderId, message) => {
	//console.log("token:",whatsappToken)
	try {

		// Posts the message to Whatsapp
		const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;
		const data = {
			messaging_product: "whatsapp",
			recipient_type: "individual",
			to: senderId,
			type: "text",
			text: {
				preview_url: true,
				body: message,
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
					"Error enviando a Facebook en handleWhatsappMessage.js--->",
					error.response ? error.response.data : error.message
				);
			});
			console.log("envie el mensaje", response.data)
	} catch (error) {
		console.log("Error en handleWhatsappMessage.js", error.response ? error.response.data : error.message);
		
		throw error.response ? error.response.data : error.message;
	}
};
