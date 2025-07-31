import { convertBufferImageToUrl } from "../media/convertBufferImageToUrl.js";
import { downloadWhatsAppMedia } from "../media/downloadWhatsAppMedia.js";
import { errorMessage1 } from "../errors/errorMessages.js";
import { getMediaWhatsappUrl } from "../media/getMediaWhatsappUrl.js";
import { handleWhatsappMessage } from "../whatsapp/handleWhatsappMessage.js";
import { adminWhatsAppNotification } from "../notifications/adminWhatsAppNotification.js";
import { processWhatsAppWithApi } from "../whatsapp/processWhatsAppWithApi.js";

const adminPhone = process.env.ADMIN_PHONE;

// Class definition for the Queue
export class WhatsAppMessageQueue {
	constructor() {
		this.queues = new Map();
	}

	// Function to process the Queue
	async processQueue(senderId) {
		const queue = this.queues.get(senderId);
		//console.log("Queue:", queue);

		//If there is no queue or there is no processing return
		if (!queue || queue.processing) return;

		// Turn processing to true
		queue.processing = true;

		while (queue.messages.length > 0) {
			// Take the first record and delete it from the queue
			let newMessage = queue.messages.shift();
			let imageURL;
			let documentURL;

			try {
				// Determine the message depending the TYPE: text, audio, image or document
				if (newMessage.type === "document") {
					// --- WhatsApp documents ---//
					if (newMessage.channel === "whatsapp") {
						// Get the Document URL from WhatsApp
						const document = await getMediaWhatsappUrl(newMessage.documentId);
						const documentUrl = document.data.url;
						//console.log("Document URL:", documentUrl);

						// Download Document from WhatsApp
						const documentBuffer = await downloadWhatsAppMedia(documentUrl);
						const documentBufferData = documentBuffer.data;
						//console.log("Document download:", documentBufferData);

						// Convert buffer received from WhatsApp to a public URL
						documentURL = await convertBufferImageToUrl(
							documentBufferData,
							"https://three-2-12-messenger-api.onrender.com"
						);
						//console.log("Public Document URL:", documentURL);
					}
				}

				// Process whatsApp with API
				const log = await processWhatsAppWithApi(newMessage);
				console.log(log);
				
			} catch (error) {
				console.error(`Error en whatsAppMessageQueue.js: ${error.message}`);

				const errorMessage = error?.response?.data
					? JSON.stringify(error.response.data)
					: error.message;
					
				// Change flag to allow next message processing
				queue.processing = false;

				// Error handlers: Send error message to customer
				const customerErrorMessage = errorMessage1;
				handleWhatsappMessage(newMessage.userPhone, customerErrorMessage);

				// Send WhatsApp error message to Admin
				const message = `🔔 *NOTIFICACION DE ERROR AL ADMIN:*\nFunción: whatsAppQueue.js\nRegistro de la Queue: ${newMessage}\nError:${errorMessage}`;

				await adminWhatsAppNotification(adminPhone, message);
			}
		}
		// Change flag to allow next message processing
		queue.processing = false;
	}

	// Function to add messages to the Queue
	enqueueMessage(userMessage, senderId, responseCallback = null) {
		// If the queue has no ID it saves it && creates messages, processing and resposeCallbach properties
		if (!this.queues.has(senderId)) {
			this.queues.set(senderId, {
				messages: [],
				processing: false,
				responseCallback: null,
			});
		}

		// Look for the queue with the sender ID
		const queue = this.queues.get(senderId);
		//console.log("Queue:", queue);

		// Add the message to the Queue
		queue.messages.push(userMessage);

		// Process the queue
		this.processQueue(senderId);
	}
}
