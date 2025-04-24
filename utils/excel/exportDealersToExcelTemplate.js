import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios"; // Importar axios

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const exportDealersToExcelTemplate = async (dealers) => {
    try {
        const excelTemplate = "https://raw.githubusercontent.com/Gusgv-arg/3.2.14.-CAMARA-CES./main/assets/Plantilla_Base_Redes.xlsx";
        
        // Cargar la plantilla de Excel usando axios
        const response = await axios.get(excelTemplate, { responseType: 'arraybuffer' });
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(response.data);

        // Obtener las hojas
        const dealersSheet = workbook.getWorksheet('Concesionarios');
        const employeesSheet = workbook.getWorksheet('Personal');

        // Procesar datos de concesionarios
        let dealerRow = 2; // Comenzar desde la fila 2
        dealers.forEach(dealer => {
            if (dealer.isActive) {
                dealersSheet.getCell(`A${dealerRow}`).value = dealer.brand;
                dealersSheet.getCell(`B${dealerRow}`).value = dealer.name;
                dealersSheet.getCell(`C${dealerRow}`).value = dealer.code;
                dealersSheet.getCell(`D${dealerRow}`).value = dealer.province;
                dealersSheet.getCell(`E${dealerRow}`).value = dealer.address;
                dealersSheet.getCell(`F${dealerRow}`).value = dealer.cuit;
                dealerRow++;
            }
        });

        // Procesar datos de empleados
        let employeeRow = 2; // Comenzar desde la fila 2
        dealers.forEach(dealer => {
            if (dealer.isActive && dealer.employees) {
                dealer.employees.forEach(employee => {
                    if (employee.isActive) {
                        // Datos del concesionario
                        employeesSheet.getCell(`A${employeeRow}`).value = dealer.name;
                        employeesSheet.getCell(`B${employeeRow}`).value = dealer.code;
                        
                        // Datos del empleado
                        employeesSheet.getCell(`C${employeeRow}`).value = employee.empName;
                        employeesSheet.getCell(`D${employeeRow}`).value = employee.phone;
                        employeesSheet.getCell(`E${employeeRow}`).value = employee.mail;
                        employeesSheet.getCell(`F${employeeRow}`).value = employee.profile;
                        
                        employeeRow++;
                    }
                });
            }
        });

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
