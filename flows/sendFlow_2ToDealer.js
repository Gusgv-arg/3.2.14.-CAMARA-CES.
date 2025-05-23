import axios from "axios";
import { adminWhatsAppNotification } from "../utils/notifications/adminWhatsAppNotification.js";
import { searchFlow_2Structure } from "./searchFlow_2Structure.js";

const whatsappToken = process.env.WHATSAPP_TOKEN;
const myPhoneNumberId = process.env.WHATSAPP_PHONE_ID;
const adminPhone = process.env.ADMIN_PHONE;

export const sendFlow_2ToDealer = async (userMessage) => {
    // URL where to post
    const url = `https://graph.facebook.com/v21.0/${myPhoneNumberId}/messages?access_token=${whatsappToken}`;

    // Search Flow structure for post request
    const flowStructure = searchFlow_2Structure(process.env.FLOW_2);

    const { components, language } = flowStructure;

    // Payload for sending a template with an integrated flow
    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: userMessage.userPhone,
        type: "template",
        template: {
            name: process.env.FLOW_2,
            language: { code: language },
            components: components,
        },
    };

    try {
        // Post to the customer
        const response = await axios.post(url, payload, {
            headers: { "Content-Type": "application/json" },
        });

        console.log("Id del whatsApp FLOW2 enviado:", response.data.messages[0].id)
        const wamId = response.data.messages[0].id
        return wamId
        
    } catch (error) {
        const errorMessage = error?.response?.data
        ? JSON.stringify(error.response.data)
        : error.message

        console.error(
            `Error en sendFlow_2ToDealer.js:`,
            errorMessage
        );

        // Handle the Error		
        // Notify Error to the Admin
        const message = `🔔 *NOTIFICACION DE ERROR en sendFlow_2ToDealer.js:* Hubo un error al enviar el Flow 1 al cliente ${userMessage.name} con celular ${userMessage.userPhone}.\nError: ${errorMessage}`;
        await adminWhatsAppNotification(adminPhone, message);
    }
};
