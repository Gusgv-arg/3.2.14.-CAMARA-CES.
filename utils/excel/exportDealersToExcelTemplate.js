import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios"; // Importar axios

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const exportDealersToExcelTemplate = async (dealers) => {
    try {
        //const leadsTemplate = "https://raw.githubusercontent.com/Gusgv-arg/3.2.10.MEGAMOTO-Campania-WhatsApp/main/public/temp/PlantillaLeads.xlsx";
        const excelTemplate = "";
        
        // Cargar la plantilla de Excel usando axios
        const response = await axios.get(excelTemplate, { responseType: 'arraybuffer' });
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(response.data);
        const worksheet = workbook.getWorksheet(1); // Obtener la primera hoja de la plantilla

        // Agregar los datos
        

        // Generar nombre para el archivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `Concesionarios_${timestamp}.xlsx`;
        const outputPath = path.join(__dirname, "../../public", fileName);

        // Guardar el archivo
        await workbook.xlsx.writeFile(outputPath);
        
        // Generar y retornar la URL pública
        const fileUrl = `https://three-2-10-megamoto-campania-whatsapp.onrender.com/public/${fileName}`;
        return fileUrl;

    } catch (error) {
        const errorMessage = error?.response?.data
        ? JSON.stringify(error.response.data)
        : error.message
        
        console.error("Error en exportDealersToExcelTemplate.js:", errorMessage);

        throw errorMessage;
    }
};