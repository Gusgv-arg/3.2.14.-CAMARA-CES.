import mongoose from "mongoose";
import Dealers from "../../models/dealers.js";
import { dealers } from "../../models/dealerHardCoded.js";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv with absolute path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI 

// Función para formatear la fecha como "día/mes/año"
function formatDate(dateString) {
    const [day, month, year] = dateString.split('/'); // Dividir la fecha en partes
    return `${day}/${month}/${year}`; // Retornar en el formato deseado
}

async function createDealerDb() {
    try {
        console.log('Attempting to connect to MongoDB...');

        const connection = await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("Connected to database:", connection.connection.db.databaseName);

        // Check if dealer exists
        const existingDealer = await Dealers.findOne({ code: dealers[0].code });
        
        if (!existingDealer) {
            // Create new dealer with correct schema structure
            const newDealer = new Dealers({
                brand: dealers[0].brand,
                name: dealers[0].name,
                code: dealers[0].code,
                address: dealers[0].address,
                province: dealers[0].province,
                cuit: dealers[0].cuit,
                isActive: dealers[0].isActive,
                employees: dealers[0].employees.map(emp => ({
                    empName: emp.empName,
                    profile: emp.profile,
                    phone: emp.phone.toString(),
                    phoneOk: "NOK",
                    mail: emp.mail,
                    mailOk: "NOK",
                    presidentMandate: formatDate(emp.presidentMandate),
                    isActive: emp.isActive,
                    docs: []
                }))
            });

            try {
                const savedDealer = await newDealer.save();
                console.log("Dealer created successfully:", JSON.stringify(savedDealer, null, 2));

                // Verify creation
                const verifyDealer = await Dealers.findOne({ code: dealers[0].code });
                console.log("Post-save verification:", verifyDealer ? "Dealer found" : "Dealer not found");
            } catch (validationError) {
                console.error("Validation Error:", validationError.message);
                if (validationError.errors) {
                    Object.keys(validationError.errors).forEach(key => {
                        console.error(`Field ${key}:`, validationError.errors[key].message);
                    });
                }
            }
        } else {
            console.log("Dealer already exists in database");
        }

    } catch (error) {
        console.error("Connection Error:", error.message);
    } finally {
        // Wait before closing connection
        setTimeout(async () => {
            await mongoose.connection.close();
            console.log("Connection closed");
            process.exit(0);
        }, 1000);
    }
}

// Execute
createDealerDb().catch(err => {
    console.error("Fatal Error:", err);
    process.exit(1);
});