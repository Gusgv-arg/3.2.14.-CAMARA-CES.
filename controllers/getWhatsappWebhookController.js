
// With a GET Facebook verifies my Whatsapp webhook
export const getWhatsappWebhookController = (req, res) => {
	let WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_MY_VERIFY_TOKEN;
	console.log("entre en webhook!")
	console.log("req.query", req.query);
	console.log("req.body", req.body);
	console.log("Whatsapp verify token", WHATSAPP_VERIFY_TOKEN)

	const reqQuery= req.query
	console.log("reqQuery:", reqQuery)
	
	// Parse the query params
	let mode = req.query["hub.mode"];
	let token = req.query["hub.verify_token"];
	let challenge = req.query["hub.challenge"];

	if (mode && token) {
		// Check the mode and token sent is correct
		if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
			// Respond with the challenge token from the request
			console.log("WHATSAPP WEBHOOK VERIFIED");
			res.status(200).send(challenge);
		} else {
			// Respond with '403 Forbidden' if verify tokens do not match
			res.sendStatus(403);
		}
	} else {
		res.sendStatus(403);
	}
};
