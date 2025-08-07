import axios from "axios";
import { validateWhatsAppNumber } from "../utils/whatsapp/validateWhatsAppNumber.js";

export const validarController = async (req, res) => {
    const phones = req.body
    console.log("Phones received:", phones);
    
    const validationResults = await validateWhatsAppNumber(phones)
    
    res.status(200).send(validationResults);
};