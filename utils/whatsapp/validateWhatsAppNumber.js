import axios from 'axios';
//import dotenv from 'dotenv';
import * as dotenv from 'dotenv'

dotenv.config();
// ⚙️ Configuración
const token = process.env.WHATSAPP_TOKEN; // Token de acceso a la API de WhatsApp Business
const phoneNumberId = process.env.WHATSAPP_PHONE_ID // No es el número en sí, es el ID
const numeroAConsultar = '5491161405589'; // Número que querés validar (formato internacional)
console.log("token",token)
// 📞 Llamada al endpoint de validación
async function validarNumeroWhatsApp() {
  try {
    const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/contacts`;

    const response = await axios.post(
      url,
      {
        blocking: 'wait',
        contacts: [numeroAConsultar]
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const resultado = response.data.contacts[0];
    console.log('✅ Resultado:', resultado);

    if (resultado.status === 'valid') {
      console.log(`✅ El número ${resultado.input} tiene WhatsApp. wa_id: ${resultado.wa_id}`);
    } else {
      console.log(`❌ El número ${resultado.input} NO tiene WhatsApp.`);
    }

  } catch (error) {
    console.error('❌ Error en la consulta:', error.response?.data || error.message);
  }
}

validarNumeroWhatsApp();
