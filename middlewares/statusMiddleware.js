import { adminWhatsAppNotification } from "../utils/notifications/adminWhatsAppNotification.js";

const adminPhone = process.env.ADMIN_PHONE;

export const statusMiddleware = async (req, res, next) => {
	const body = req.body;
	let status = body?.entry?.[0].changes?.[0].value?.statuses?.[0]
		? body.entry[0].changes[0].value.statuses[0]
		: null;

	// Check status update && save in DB
	if (status !== null) {
		//console.log("Status-->", status);
		const recipient_id =
			body.entry[0].changes[0].value.statuses[0].recipient_id;
		const wab_id = body.entry[0].changes[0].value.statuses[0].id;
		let newStatus = body.entry[0].changes[0].value.statuses[0].status;

		if (newStatus === "sent") {
			newStatus = "enviado";
		} else if (newStatus === "delivered") {
			newStatus = "entregado";
		} else if (newStatus === "read") {
			newStatus = "leído";
		}

		try {
			// Buscar en la base de datos el registro para actualizar su status
			res.status(200).send("EVENT_RECEIVED");
			return;

		} catch (error) {
			const errorMessage = error?.response?.data
				? JSON.stringify(error.response.data)
				: error.message;

			console.log("Error in statusMiddleware.js", errorMessage);

			const message = `🔔 *NOTIFICACION DE ERROR en statusMiddleware.js:*\n${errorMessage}`;

			await adminWhatsAppNotification(adminPhone, message);
		}
	} else {
		next();
	}
};
