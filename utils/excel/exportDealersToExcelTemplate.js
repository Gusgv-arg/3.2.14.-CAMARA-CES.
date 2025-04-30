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

        // Verificar que las hojas existen
        if (!dealersSheet || !employeesSheet) {
            throw new Error("No se encontraron las hojas 'Concesionarios' o 'Personal' en la plantilla.");
        }

        // Copiar validaciones de datos desde la fila de encabezado
        const copyHeaderValidations = (sourceSheet, targetSheet) => {
            const headerRow = sourceSheet.getRow(1); // Fila de encabezado
            headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                if (cell && cell.dataValidation) {
                    console.log(`Copiando validación de la columna ${colNumber}:`, cell.dataValidation);
                    targetSheet.getColumn(colNumber).eachCell({ includeEmpty: true }, (targetCell) => {
                        targetCell.dataValidation = { ...cell.dataValidation }; // Copiar validación
                    });
                } else {
                    console.warn(`No se encontró validación en la columna ${colNumber}`);
                }
            });
        };

        // Copiar validaciones de encabezado
        copyHeaderValidations(dealersSheet, dealersSheet);
        copyHeaderValidations(employeesSheet, employeesSheet);

        // Procesar datos de concesionarios
        let dealerRow = 2; // Comenzar desde la fila 2
        dealers.forEach(dealer => {
            if (dealer.isActive) {
                dealersSheet.getCell(`A${dealerRow}`).value = dealer.brand;
                dealersSheet.getCell(`B${dealerRow}`).value = dealer.name;
                const codeCell = dealersSheet.getCell(`C${dealerRow}`);
                codeCell.value = Number(dealer.code);
                codeCell.numFmt = '0';
                dealersSheet.getCell(`D${dealerRow}`).value = dealer.province;
                dealersSheet.getCell(`E${dealerRow}`).value = dealer.address;
                const cuitCell = dealersSheet.getCell(`F${dealerRow}`);
                cuitCell.value = Number(dealer.cuit);
                cuitCell.numFmt = '0';
                dealersSheet.getCell(`G${dealerRow}`).value = dealer.isActive;
                dealerRow++;
            }
        });

        // Procesar datos de empleados
        let employeeRow = 2; // Comenzar desde la fila 2
        dealers.forEach(dealer => {
            if (dealer.isActive && dealer.employees) {
                dealer.employees.forEach(employee => {
                    if (employee.isActive) {
                        employeesSheet.getCell(`A${employeeRow}`).value = dealer.brand;
                        employeesSheet.getCell(`B${employeeRow}`).value = dealer.name;
                        const dealerCodeCell = employeesSheet.getCell(`C${employeeRow}`);
                        dealerCodeCell.value = Number(dealer.code);
                        dealerCodeCell.numFmt = '0';
                        employeesSheet.getCell(`D${employeeRow}`).value = employee.empName;
                        const phoneCell = employeesSheet.getCell(`E${employeeRow}`);
                        phoneCell.value = Number(employee.phone);
                        phoneCell.numFmt = '0';
                        employeesSheet.getCell(`F${employeeRow}`).value = employee.phoneOk;
                        employeesSheet.getCell(`G${employeeRow}`).value = employee.mail;
                        employeesSheet.getCell(`H${employeeRow}`).value = employee.mailOk;
                        employeesSheet.getCell(`I${employeeRow}`).value = employee.profile;
                        if (employee.presidentMandate) {
                            employeesSheet.getCell(`J${employeeRow}`).value = employee.presidentMandate;
                        }
                        employeesSheet.getCell(`K${employeeRow}`).value = employee.isActive;
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
            : error.message;
        
        console.error("Error en exportDealersToExcelTemplate.js:", errorMessage);
        throw errorMessage;
    }
};
