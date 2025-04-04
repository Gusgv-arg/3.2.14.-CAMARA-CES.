import axios from "axios";

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

export const adminWhatsAppNotification = async (phone, notification) => {
	try {
		
		// Posts the message to Whatsapp
		const url = `https://graph.facebook.com/v20.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;
		const data = {
			messaging_product: "whatsapp",
			recipient_type: "individual",
			to: phone,
			type: "text",
			text: {
				preview_url: true,
				body: notification,
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
					"Error enviando a Facebook------------>",
					error.response ? error.response.data : error.message
				);
			});

	} catch (error) {
		console.log("Error in adminWhatsAppNotification.js:", error.message);
		throw error;
	}
};
