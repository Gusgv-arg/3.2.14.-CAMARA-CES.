import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios"; // Importar axios

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FUNCIONA BIEN PERO APARECEN WARNINGS QUE BORRA FILTROS
export const exportFlowLeadsToTemplate = async (leads) => {
    try {
        const leadsTemplate = "https://raw.githubusercontent.com/Gusgv-arg/3.2.10.MEGAMOTO-Campania-WhatsApp/main/public/temp/PlantillaLeads.xlsx";
        
        // Cargar la plantilla de Excel usando axios
        const response = await axios.get(leadsTemplate, { responseType: 'arraybuffer' });
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(response.data);
        const worksheet = workbook.getWorksheet(1); // Obtener la primera hoja de la plantilla

        // Desproteger la hoja si está protegida
        if (worksheet.protect) {
            worksheet.unprotect(); // Desactivar protección
        }

        // Limpiar el contenido de las celdas sin eliminar las filas
        /* for (let i = 2; i <= worksheet.rowCount; i++) {
            const row = worksheet.getRow(i);
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.value = null; // Limpia el valor de la celda
            });
        } */

        // Agregar los datos
        leads.forEach((lead, index) => {
            const lastFlow = lead.lastFlow;
            console.log("lastflow:", lastFlow)
            
            // Asegúrate de que la fila exista antes de agregar datos
            let newRow = worksheet.getRow(index + 2);
            if (!newRow) {
                newRow = worksheet.addRow(); // Crea una nueva fila si no existe
            }

            newRow.values = [
                lead.name,
                lead.id_user,
                lastFlow?.client_status,
                lastFlow?.flowDate,
                lastFlow?.toContact,
                lastFlow?.messages,
                lastFlow?.brand,
                lastFlow?.model,
                lastFlow?.price,
                lastFlow?.otherProducts,
                lastFlow?.payment,
                lastFlow?.dni,
                lastFlow?.credit,
                lastFlow?.questions,
                lastFlow?.vendor_name,
                lastFlow?.vendor_notes,
                lastFlow?.history,
                lastFlow?.origin || "API General",
                lastFlow?.flow_2token,
                lastFlow?.error,
            ];

            // Copiar validaciones de datos desde la fila de encabezado
            worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
                if (!cell || !cell.column) return; // Verifica que la celda y su columna existan
                const colNum = cell.column.number;
                const newCell = newRow.getCell(colNum);
                if (worksheet.getRow(1).getCell(colNum)?.dataValidation) {
                    newCell.dataValidation = JSON.parse(JSON.stringify(worksheet.getRow(1).getCell(colNum).dataValidation));
                }
            });
        });

        // Generar nombre para el archivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `Leads_${timestamp}.xlsx`;
        const outputPath = path.join(__dirname, "../../public", fileName);

        // Guardar el archivo
        await workbook.xlsx.writeFile(outputPath);

        // Reactivar protección si estaba activada
        if (!worksheet.protect) {
            worksheet.protect("password"); // Reactivar protección con contraseña
        }

        // Generar y retornar la URL pública
        const fileUrl = `https://three-2-10-megamoto-campania-whatsapp.onrender.com/public/${fileName}`;
        return fileUrl;

    } catch (error) {
        const errorMessage = error?.response?.data
        ? JSON.stringify(error.response.data)
        : error.message
        
        console.error("Error en exportFlowLeadsToExcel.js:", errorMessage);

        throw errorMessage;
    }
};