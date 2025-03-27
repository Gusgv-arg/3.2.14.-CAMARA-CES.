import Leads from "../../models/leads.js";
import { v4 as uuidv4 } from "uuid";

export const saveNotificationInDb = async (userMessage, notification) => {
	//console.log("userMessage en saveNotification:", userMessage);
	//console.log("notification en saveNotification:", notification);

	// Obtain current date and hour
	const currentDateTime = new Date().toLocaleString("es-AR", {
		timeZone: "America/Argentina/Buenos_Aires",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	// Defino status, history y el id del whatsapp
	let status;
	let history;
	let wamId_flow1;

	if (notification.message.includes("IMPORTANTE")) {
		// Casos de faltantes de informacion en el FLOW 1

		if (notification.message.includes("modelo de interes y tu DNI")) {
			// Si falta el modelo y el DNI
			status = "faltan modelo y DNI";
			history = `${currentDateTime} - Status: faltan modelo y DNI. `;
		} else if (notification.message.includes("préstamo")) {
			// Si falta el DNI
			status = "falta DNI";
			history = `${currentDateTime} - Status: falta DNI. `;
		} else if (notification.message.includes("modelo")) {
			// Si falta modelo
			status = "falta modelo";
			history = `${currentDateTime} - Status: falta modelo. `;
		}
		wamId_flow1 = userMessage.wamId_Flow1;
	} else if (
		notification.message.includes("¡Gracias por confiar en MEGAMOTO!")
	) {
		// Envío completo del FLOW 1
		status = "esperando";
		history = `${currentDateTime} - Status: esperando. `;
	} else if (notification.message.includes("Hola nuevamente")) {
		status = "primer contacto";
		history = `${currentDateTime} - Status: primer contacto. `;
	}

	if (userMessage.wamId_Flow1) {
		wamId_flow1 = userMessage.wamId_Flow1;
	}

	//console.log("Status:", status);
	//console.log("History:", history);
	//console.log("wabId:", wamId_flow1);

	// Save the sent message to the database
	try {
		// Find the lead
		let lead = await Leads.findOne({ id_user: userMessage.userPhone });

		// If the lead does not exist for that thread, there is an error and returns.
		if (lead === null) {
			console.log("¡¡ERROR: Lead not found in DB!!");
			return;
		} else {
			// Obtener el último flujo
			let lastFlow = lead.flows[lead.flows.length - 1];

			// Si el último flow está cerrado agregar un flow nuevo al array de flows
			if (
				lastFlow.client_status === "compró" ||
				lastFlow.client_status === "no compró"
			) {
				// Crear un token 2 y un nuevo flujo para agregarlo al array
				const flowToken2 = `2${uuidv4()}`;

				lastFlow = {
					flowName: process.env.FLOW_1,
					flowDate: currentDateTime,
					flow1Response: notification.brand || notification.brand === "" ? "si" : "no",
					client_status: status,
					statusDate: currentDateTime,
					messages: `\n${currentDateTime} ${userMessage.name}: ${
						userMessage.message
					}\n${currentDateTime} - API: ${notification.message.replace(
						/\n/g,
						" "
					)}`,
					history: history ? history : "",
					flow_2token: flowToken2,
					flow_status: "activo",
					origin: "API General",
					brand: notification.brand,
					model: notification.model,
					otherProducts: notification.otherProducts,
					price: notification.price,
					payment: notification.payment,
					dni: notification.dni,
					credit: "",
					questions: notification.questions,
					wamId_flow1: wamId_flow1 ? wamId_flow1 : "",
				};
				lead.flows.push(lastFlow); // Agrega el nuevo flujo al array
			
			} else {
				// Hay un Flow abierto

				// Actualizo la información
				notification.brand || notification.brand === "" ? lastFlow.flow1Response = "si" : lastFlow.flow1Response = "no"
				lastFlow.messages += `\n${currentDateTime} ${userMessage.name}: ${userMessage.message}\n${currentDateTime} - API: ${notification.message.replace(/\n/g," ")}`
				lastFlow.brand = notification?.brand !== "" ? notification.brand : lastFlow.brand;
				lastFlow.model = notification?.model;
				lastFlow.price = notification?.price;
				lastFlow.otherProducts = notification?.otherProducts;
				lastFlow.payment = notification?.payment;
				lastFlow.dni = notification?.dni;
				lastFlow.questions = notification?.questions;
				lastFlow.client_status = status ? status : lastFlow.client_status;
				lastFlow.statusDate = status ? currentDateTime : lastFlow.statusDate
				lastFlow.history += history ? history : "";
				// Grabo el wamId para oder traquearlo
				lastFlow.wamId_flow1 = wamId_flow1 ? wamId_flow1 : "";
			}

			// Update lead
			await lead.save();
			return;
		}
	} catch (error) {
		const errorMessage = error?.response?.data
			? JSON.stringify(error.response.data)
			: error.message;

		console.log("error en saveNotificationInDb.js:", errorMessage);
		throw new Error(errorMessage);
	}
};
