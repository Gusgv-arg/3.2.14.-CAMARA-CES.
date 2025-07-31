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

const formatDate = (date) => {
	if (date instanceof Date) {
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	}
	return date;
};

export const abmDealers = async (documentBufferData) => {
	try {
		// Leer el archivo Excel recibiendo un buffer
		const workbook = xlsx.read(documentBufferData, {
			type: "buffer",
			cellDates: true,
		});

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
				Razón_Social,
				Forma_Jurídica,
				Nombre_Grupo,
				Nombre_Fantasía,
				Fiat,
				Peugeot,
				Citroen,
				Jeep_Ram,
				Activo,
			} = dealer;

			try {
				// Buscar el concesionario en la base de datos x marca y código
				let existingDealer = await Dealers.findOne({
					name: Razón_Social,
				});

				if (existingDealer) {
					// Actualizar concesionario existente
					existingDealer.name = Razón_Social
						? Razón_Social
						: existingDealer.name;
					existingDealer.legal_form = Forma_Jurídica
						? Forma_Jurídica
						: existingDealer.legal_form;
					existingDealer.group_name = Nombre_Grupo
						? Nombre_Grupo
						: existingDealer.group_name;
					existingDealer.fantasy_name = Nombre_Fantasía
						? Nombre_Fantasía
						: existingDealer.fantasy_name;
					existingDealer.fiat = Fiat ? Fiat : existingDealer.fiat;
					existingDealer.peugeot = Peugeot ? Peugeot : existingDealer.peugeot;
					existingDealer.citroen = Citroen ? Citroen : existingDealer.citroen;
					existingDealer.jeep_ram = Jeep_Ram
						? Jeep_Ram
						: existingDealer.jeep_ram;
					existingDealer.isActive = Activo === "SI" ? "SI" : "NO";
					await existingDealer.save();
				} else {
					// Crear un nuevo concesionario
					existingDealer = new Dealers({
						name: Razón_Social,
						legal_form: Forma_Jurídica || "S.A.",
						group_name: Nombre_Grupo || "",
						fantasy_name: Nombre_Fantasía || "",
						isActive:
							Activo && Activo.trim() !== ""
								? Activo === "SI"
									? "SI"
									: "NO"
								: "SI",
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
				Razón_Social,
				Fiat,
				Peugeot,
				Citroen,
				Jeep_Ram,
				Nombre,
				Celular,
				Celular_OK,
				Mail,
				Mail_OK,
				Perfil,
				Mandato_Presidente,
				Activo,
			} = person;

			// Convertir Mandato_Presidente a formato dd/mm/yyyy
			const mandatoPresidenteStr =
				Mandato_Presidente instanceof Date
					? formatDate(Mandato_Presidente)
					: Mandato_Presidente;

			try {
				// Buscar el concesionario correspondiente
				const dealer = await Dealers.findOne({
					name: Razón_Social					
				});

				if (dealer) {
					// Buscar si el empleado ya existe
					const existingEmployee = dealer.employees.find(
						(emp) => emp.phone === String(Celular)
					);

					if (existingEmployee) {
						// Actualizar empleado existente
						existingEmployee.empName = Nombre
							? Nombre
							: existingEmployee.empName;
						existingEmployee.profile = Perfil
							? Perfil
							: existingEmployee.profile;

						if (Perfil === "Presidente") {
							if (mandatoPresidenteStr && isValidDate(mandatoPresidenteStr)) {
								existingEmployee.presidentMandate = mandatoPresidenteStr;
							} else {
								verificationData.updateErrors.push({
									type: "Personal",
									data: person,
									error: `Fecha inválida para Mandato_Presidente: ${mandatoPresidenteStr}`,
								});
							}
						} else {
							// Validar que la fecha de mandato no sea mayor a la actual
							if (existingEmployee.presidentMandate) {
								const today = new Date();
								const [day, month, year] = existingEmployee.presidentMandate
									.split("/")
									.map(Number);
								const mandateDate = new Date(year, month - 1, day);

								if (mandateDate > today) {
									verificationData.updateErrors.push({
										type: "Personal",
										data: `${Concesionario}: ${Código}`,
										error: `No se puede cambiar el perfil a "${Perfil}" porque el mandato como Presidente es válido hasta ${existingEmployee.presidentMandate}`,
									});
									continue; // Salir sin actualizar el registro
								}
							}
							// Mantener la fecha existente si el perfil cambia
							if (!mandatoPresidenteStr || !isValidDate(mandatoPresidenteStr)) {
								person.Mandato_Presidente = existingEmployee.presidentMandate;
							}
						}

						existingEmployee.isActive = Activo === "SI" ? "SI" : "NO";
						if (existingEmployee.mail !== Mail) {
							existingEmployee.mailOk = "Sin_Verificar"; // Cambiar el estado del mail a NOK si es diferente
							verificationData.mailsNOK.push(Mail);
						}
						existingEmployee.mail = Mail ? Mail : existingEmployee.mail;
					} else {
						const newEmployee = {
							empName: Nombre,
							phone: Celular,
							phoneOk: "Sin_Verificar",
							mail: Mail,
							mailOk: "Sin_Verificar",
							profile: Perfil,
							isActive:
								Activo && Activo.trim() !== ""
									? Activo === "SI"
										? "SI"
										: "NO"
									: "SI",
						};

						if (Perfil === "Presidente") {
							if (mandatoPresidenteStr && isValidDate(mandatoPresidenteStr)) {
								newEmployee.presidentMandate = mandatoPresidenteStr;
							} else {
								verificationData.updateErrors.push({
									type: "Personal",
									data: person,
									error: `Fecha inválida para Mandato_Presidente: ${mandatoPresidenteStr}`,
								});
							}
						}

						dealer.employees.push(newEmployee);
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
