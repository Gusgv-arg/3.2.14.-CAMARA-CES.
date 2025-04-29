import xlsx from "xlsx";
import Dealers from "../../models/dealers.js";

// Función para validar el formato de fecha (día/mes/año)
const isValidDate = (dateString) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/; // Formato: dd/mm/yyyy
    if (!regex.test(dateString)) return false;

    const [day, month, year] = dateString.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
};

export const abmDealers = async (documentBufferData) => {
	try {
		// Leer el archivo Excel recibiendo un buffer
		const workbook = xlsx.read(documentBufferData, { type: "buffer" });

		// Obtener las hojas de trabajo
		const dealersSheet = workbook.Sheets["Concesionarios"];
		const personalSheet = workbook.Sheets["Personal"];

		if (!dealersSheet || !personalSheet) {
			throw new Error(
				"El archivo Excel debe contener las hojas 'Concesionarios' y 'Personal'."
			);
		}

		// Convertir las hojas a JSON
		const dealersData = xlsx.utils.sheet_to_json(dealersSheet);
		const personalData = xlsx.utils.sheet_to_json(personalSheet);
		
		console.log("personalData", personalData);

		// Objeto para almacenar los teléfonos y correos con estado "NOK"
		const verificationData = {
			phonesNOK: [],
			mailsNOK: [],
			updateErrors: [],
		};

		// Procesar los concesionarios
		for (const dealer of dealersData) {
			const {
				Marca,
				Concesionario,
				Código,
				Provincia,
				Domicilio,
				Cuit,
				Activo,
			} = dealer;

			try {
				// Buscar el concesionario en la base de datos x marca y código
				let existingDealer = await Dealers.findOne({
					brand: Marca,
					code: Código,
				});

				if (existingDealer) {
					// Actualizar concesionario existente
					existingDealer.name = Concesionario
						? Concesionario
						: existingDealer.name;
					existingDealer.province = Provincia
						? Provincia
						: existingDealer.province;
					existingDealer.address = Domicilio
						? Domicilio
						: existingDealer.address;
					existingDealer.cuit = Cuit ? Cuit : existingDealer.cuit;
					existingDealer.isActive = Activo === "SI" ? "SI" : "NO";
					await existingDealer.save();
				} else {
					// Crear un nuevo concesionario
					existingDealer = new Dealers({
						brand: Marca,
						name: Concesionario,
						code: Código,
						province: Provincia,
						address: Domicilio,
						cuit: Cuit,
						isActive: Activo && Activo.trim() !== "" ? (Activo === "SI" ? "SI" : "NO") : "SI",
        				employees: [],
					});
					await existingDealer.save();
				}
			} catch (error) {
				// Acumular errores en updateErrors
				verificationData.updateErrors.push({
					type: "Concesionario",
					data: dealer,
					error: error.message,
				});
			}
		}

		// Procesar el personal
		for (const person of personalData) {
			const {
				Marca,
				Concesionario,
				Código,
				Nombre,
				Celular,
				Mail,
				Perfil,
				Mandato_Presidente,
				Activo,
			} = person;

			try {
			
				// Buscar el concesionario correspondiente
				const dealer = await Dealers.findOne({
					brand: Marca,
					code: Código,
				});
	
				if (dealer) {
					// Buscar si el empleado ya existe
					const existingEmployee = dealer.employees.find(
						(emp) => emp.phone === Celular
					);
	
					if (existingEmployee) {
						// Actualizar empleado existente
						existingEmployee.empName = Nombre ? Nombre : existingEmployee.empName;
						existingEmployee.profile = Perfil ? Perfil : existingEmployee.profile;

						const mandatoPresidenteStr = Mandato_Presidente ? String(Mandato_Presidente).trim() : null;
						if (Perfil === "Presidente") {
							console.log("Validando Mandato_Presidente:", Mandato_Presidente); // Verificar el valor
    
							if (mandatoPresidenteStr && isValidDate(Mandato_Presidente)) {
								existingEmployee.presidentMandate = mandatoPresidenteStr;
							} else {
								// Agregar al array de errores si la fecha no es válida
								verificationData.updateErrors.push({
									type: "Personal",
									data: person,
									error: `Fecha inválida para Mandato_Presidente: ${Mandato_Presidente}`,
								});
							}
						}

						existingEmployee.isActive = Activo === "SI" ? "SI" : "NO";
						if (existingEmployee.mail !== Mail) {
							existingEmployee.mailOk = "Sin_Verificar"; // Cambiar el estado del mail a NOK si es diferente
							verificationData.mailsNOK.push(Mail);
						}
						existingEmployee.mail = Mail ? Mail : existingEmployee.mail;
					} else {
						// Agregar un nuevo empleado
						dealer.employees.push({
							empName: Nombre,
							phone: Celular,
							phoneOk: "Sin_Verificar",
							mail: Mail,
							mailOk: "Sin_Verificar",
							profile: Perfil,
							...(Perfil === "Presidente" && { presidentMandate: Mandato_Presidente ? Mandato_Presidente : null }),    
							isActive: Activo && Activo.trim() !== "" ? (Activo === "SI" ? "SI" : "NO") : "SI",
						});
	
						// Agregar a la lista de verificación
						verificationData.phonesNOK.push(Celular);
						if (Mail) {
							verificationData.mailsNOK.push(Mail);
						}						
					}	
					await dealer.save();
				}
			} catch (error) {
				// Acumular errores en updateErrors
				verificationData.updateErrors.push({
					type: "Personal",
					data: person,
					error: error.message,
				  });
			}
		}

		console.log("Procesamiento ABM Dealers completado.");
		return verificationData;
	} catch (error) {
		console.error("Error en abmDealers:", error.message);
		throw error;
	}
};
