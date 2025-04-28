import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import Dealers from "../../models/dealers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const exportDealersToExcelTemplate = async () => {
    try {
        // Obtener todos los dealers de la base de datos
        const dealers = await Dealers.find({});
        
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
                // Configurar formato numérico para código
                const codeCell = dealersSheet.getCell(`C${dealerRow}`);
                codeCell.value = Number(dealer.code);
                codeCell.numFmt = '0';
                dealersSheet.getCell(`D${dealerRow}`).value = dealer.province;
                dealersSheet.getCell(`E${dealerRow}`).value = dealer.address;
                // Configurar formato numérico para CUIT
                const cuitCell = dealersSheet.getCell(`F${dealerRow}`);
                cuitCell.value = Number(dealer.cuit);
                cuitCell.numFmt = '0';
                dealerRow++;
                dealersSheet.getCell(`G${dealerRow}`).value = dealer.isActive;
            }
        });

        // Procesar datos de empleados
        let employeeRow = 2; // Comenzar desde la fila 2
        dealers.forEach(dealer => {
            if (dealer.isActive && dealer.employees) {
                dealer.employees.forEach(employee => {
                    if (employee.isActive) {
                        // Datos del concesionario
                        employeesSheet.getCell(`A${employeeRow}`).value = dealer.brand;
                        employeesSheet.getCell(`B${employeeRow}`).value = dealer.name;
                        
                        // Configurar formato numérico para código del dealer
                        const dealerCodeCell = employeesSheet.getCell(`C${employeeRow}`);
                        dealerCodeCell.value = Number(dealer.code);
                        dealerCodeCell.numFmt = '0';
                        
                        // Datos del empleado
                        employeesSheet.getCell(`D${employeeRow}`).value = employee.empName;

                        // Configurar formato numérico para teléfono
                        const phoneCell = employeesSheet.getCell(`E${employeeRow}`);
                        phoneCell.value = Number(employee.phone);
                        phoneCell.numFmt = '0';
                        
                        employeesSheet.getCell(`F${employeeRow}`).value = employee.mail;
                        employeesSheet.getCell(`G${employeeRow}`).value = employee.profile;
                        
                        // Agregar fecha de mandato presidencial si existe
                        if (employee.presidentMandate) {
                            employeesSheet.getCell(`H${employeeRow}`).value = new Date(employee.presidentMandate);
                            employeesSheet.getCell(`H${employeeRow}`).numFmt = 'dd/mm/yyyy';
                        }
                        employeesSheet.getCell(`I${employeeRow}`).value = employee.isActive;
                        
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
        const fileUrl = `https://three-2-14-camara-ces.onrender.com/public/${fileName}`;
        return fileUrl;

    } catch (error) {
        const errorMessage = error?.response?.data
            ? JSON.stringify(error.response.data)
            : error.message
        
        console.error("Error en exportDealersToExcelTemplate.js:", errorMessage);
        throw errorMessage;
    }
};
