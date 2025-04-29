import xlsx from "xlsx";
import Dealers from "../../models/dealers.js";

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
						isActive: Activo === "SI" ? "SI" : "NO",
						employees: [],
					});
					await existingDealer.save();
				}
			} catch (error) {
				// Acumular errores en updateErrors
				verificationData.updateErrors.push({
					type: "Dealer",
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
				"Vencimiento mandato Presidente": VencimientoMandato,
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
						existingEmployee.presidentMandate = VencimientoMandato || null;
						existingEmployee.isActive = Activo === "SI" ? "SI" : "NO";
						if (existingEmployee.mail !== Mail) {
							existingEmployee.mailOk = "NOK"; // Cambiar el estado del mail a NOK si es diferente
							verificationData.mailsNOK.push(Mail);
						}
						existingEmployee.mail = Mail ? Mail : existingEmployee.mail;
					} else {
						// Agregar un nuevo empleado
						dealer.employees.push({
							empName: Nombre,
							phone: Celular,
							phoneOk: "NOK",
							mail: Mail,
							mailOk: "NOK",
							profile: Perfil,
							presidentMandate: VencimientoMandato || null,
							isActive: Activo === "SI" ? "SI" : "NO",
						});
	
						// Agregar a la lista de verificación
						verificationData.phonesNOK.push(Celular);
						verificationData.mailsNOK.push(Mail);
					}
	
					await dealer.save();
				}
			} catch (error) {
				// Acumular errores en updateErrors
				verificationData.updateErrors.push({
					type: "Employee",
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
