import express from "express";
 import { getWhatsappWebhookController } from "../controllers/getWhatsappWebhookController.js";
import { postWhatsappWebhookController } from "../controllers/postWhastsappWebhookController.js";
import { statusMiddleware } from "../middlewares/statusMiddleware.js";
/*import { adminFunctionsMiddleware } from "../middlewares/adminFunctionsMiddleware.js";
import { whatsAppGeneralBotSwitchMiddleware } from "../middlewares/whatsAppGeneralBotSwitchMiddleware.js";
import { postWhatsAppCampaign } from "../functions/postWhatsAppCampaign.js";
import { statusFlowsMiddleware } from "../middlewares/statusFlowsMiddleware.js";
import { vendorsFunctionsMiddleware } from "../middlewares/vendorsFunctionsMiddleware.js";
 */
const whatsappRouter = express.Router();

whatsappRouter.get("/", getWhatsappWebhookController);
whatsappRouter.post(
	"/",
	statusMiddleware,
	//statusFlowsMiddleware,
	//adminFunctionsMiddleware,
	//vendorsFunctionsMiddleware,
	//whatsAppGeneralBotSwitchMiddleware,
	postWhatsappWebhookController
); 


export default whatsappRouter;
