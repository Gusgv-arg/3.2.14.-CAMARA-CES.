import axios from "axios";
import dotenv from "dotenv";
dotenv.config()
const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;
//console.log("Token de WhatsApp:", whatsappToken);

export const downloadWhatsAppMedia = async (mediaUrl) => {
	try {
		const download = await axios.get(mediaUrl, {
			responseType: "arraybuffer",
			headers: {
				Authorization: `Bearer ${whatsappToken}`,
			},
		});
		//console.log("Audio URL en getAudioWhatsappUrl", audioUrl);
		return download;
	} catch (error) {
		console.log("Error en downloadWhatsAppMedia", error.message);
		throw error;
	}
};
