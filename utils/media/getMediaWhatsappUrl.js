import axios from "axios";

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;
//console.log("Token de WhatsApp:", whatsappToken);

export const getMediaWhatsappUrl = async (mediaId) => {
	const url = `https://graph.facebook.com/v20.0/${mediaId}?phone_number_id=${myPhoneNumberId}`;
	try {
		const mediaUrl = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${whatsappToken}`,
			},
		});
		//console.log("Media URL en getMediaWhatsappUrl", mediaUrl);
		return mediaUrl;
	} catch (error) {
		console.log("Error en getMediaWhatsappUrl", error.message);
		throw error;
	}
};
