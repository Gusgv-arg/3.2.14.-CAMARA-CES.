import { adminWhatsAppNotification } from "../notifications/adminWhatsAppNotification.js";
import { processWhatsAppFlowWithApi } from "../whatsapp/processWhatsAppFlowWithApi.js";
import { errorMessage1 } from "../errors/errorMessages.js";
import { handleWhatsappMessage } from "../whatsapp/handleWhatsappMessage.js";

const adminPhone = process.env.ADMIN_PHONE;

// Class definition for the Queue
export class WhatsAppFlowMessageQueue {
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
			let userMessage = queue.messages.shift();
			let imageURL;
			let documentURL;

			try {
				// Process the message
				const log = await processWhatsAppFlowWithApi(userMessage);
				console.log(log);

			} catch (error) {
				
				// Manejo de errores centralizado
				let errorMessage 
				
				if (error.includes("Error llamando a la APi de Credicuotas:")){
					errorMessage = error
				} else {
					errorMessage = error?.response?.data
					? JSON.stringify(error.response.data)
					: error.message; 
					// Send error message to customer
					const errorMessageToCustomer = errorMessage1;
					handleWhatsappMessage(userMessage.userPhone, errorMessageToCustomer);
				}
				//console.error("Error desde whatsAppFlowQueue.js:", errorMessage);

				// Change flag to allow next message processing
				queue.processing = false;

				// Send WhatsApp error message to Admin
				const message = `🔔 *NOTIFICACION DE ERROR AL ADMIN en whatsAppFlowQueue.js:*\nLead ${userMessage.name} Cel. ${userMessage.userPhone}.\nError: ${errorMessage}.`;

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
