import axios from "axios";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
dotenv.config({ path: join(__dirname, "../../.env") });

const whatsAppToken = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_ID;
//const phonesToCheck = ["5491161405589", "5491139023969"];
//const phonesToCheck = ["5491161405589"];
const checkedPhones = [];

// Función que recibe un array de objetos con las propiedades "nombre" y "celular"
export const validateWhatsAppNumber = async (phonesToCheck) => {
	
	console.log("Números de WhatsApp desde validateWhatsAppNumer.js:", phonesToCheck);
	for (const number of phonesToCheck) {
		try {
			const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages?access_token=${whatsAppToken}`;

			// Payload para mandar un texto, sin template
			/* const data = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: number,
        type: "text",
        text: {
          preview_url: true,
          body: "Usted fue dado de alta en el sistema de WhatsApp de la Cámara STELLANTIS.",
        },
      }; */

			// Payload para mandar un template
			 const data = {
				messaging_product: "whatsapp",
				recipient_type: "individual",
				to: number.celular,
				type: "template",
				template: {
					name: "camara_bienvenida",
					language: { code: "es" },
					//components: components,
				},
			};
			const response = await axios.post(url, data, {
				headers: {
					"Content-Type": "application/json",
				},
			});

			//const resultado = response.data.contacts[0];
			const resultado = response.data;
			console.log('✅ Resultado:', resultado);

			if (resultado.messages[0].message_status === "accepted") {
				//console.log(`✅ El número ${resultado.input} tiene un WhatsApp válido.`);
				checkedPhones.push({
					name: number.nombre,
					phone: resultado.contacts[0].input,
					phoneOk: "OK",
				});
			} else {
				//console.log(`❌ El número ${resultado.input} NO tiene WhatsApp.`);
				checkedPhones.push({
					name: number.nombre,
					phone: resultado.contacts[0].input,
					phoneOk: "NOK",
				});
			}
		} catch (error) {
			console.error(
				"❌ Error en la consulta:",
				error.response?.data || error.message
			);
			checkedPhones.push({
                name: number.nombre,
                phone: number.celular,
                phoneOk: "Error en la verificación"
            });
		}
	}
	console.log("✅ Verificación WhatsApp:", checkedPhones);
	return checkedPhones;
};

//validateWhatsAppNumber(phonesToCheck);
