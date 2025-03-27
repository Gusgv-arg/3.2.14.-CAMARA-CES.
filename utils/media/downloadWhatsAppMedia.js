import axios from "axios";

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;

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
