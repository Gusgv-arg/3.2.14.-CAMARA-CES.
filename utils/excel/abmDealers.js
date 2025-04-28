import xlsx from "xlsx";
import Dealers from "../../models/dealers.js";

export const abmDealers = async (filePath) => {
  try {
    // Leer el archivo Excel
    const workbook = xlsx.readFile(filePath);

    // Obtener las hojas de trabajo
    const dealersSheet = workbook.Sheets["Concesionarios"];
    const personalSheet = workbook.Sheets["Personal"];

    if (!dealersSheet || !personalSheet) {
      throw new Error("El archivo Excel debe contener las hojas 'Concesionarios' y 'Personal'.");
    }

    // Convertir las hojas a JSON
    const dealersData = xlsx.utils.sheet_to_json(dealersSheet);
    const personalData = xlsx.utils.sheet_to_json(personalSheet);

    // Procesar los concesionarios
    for (const dealer of dealersData) {
      const { Marca, Concesionario, Código, Provincia, Domicilio, Cuit, Activo } = dealer;

      // Buscar el concesionario en la base de datos
      let existingDealer = await Dealers.findOne({
        brand: Marca,
        name: Concesionario,
        code: Código,
      });

      if (existingDealer) {
        // Actualizar concesionario existente
        existingDealer.province = Provincia;
        existingDealer.address = Domicilio;
        existingDealer.cuit = Cuit;
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
    }

    // Procesar el personal
    for (const person of personalData) {
      const { Marca, Concesionario, Código, Nombre, Celular, Mail, Perfil, "Vencimiento mandato Presidente": VencimientoMandato, Activo } = person;

      // Buscar el concesionario correspondiente
      const dealer = await Dealers.findOne({
        brand: Marca,
        name: Concesionario,
        code: Código,
      });

      if (dealer) {
        // Buscar si el empleado ya existe
        const existingEmployee = dealer.employees.find(
          (emp) => emp.phone === Celular
        );

        if (existingEmployee) {
          // Actualizar empleado existente
          existingEmployee.empName = Nombre;
          existingEmployee.mail = Mail;
          existingEmployee.profile = Perfil;
          existingEmployee.presidentMandate = VencimientoMandato || null;
          existingEmployee.isActive = Activo === "SI" ? "SI" : "NO";
        } else {
          // Agregar un nuevo empleado
          dealer.employees.push({
            empName: Nombre,
            phone: Celular,
            mail: Mail,
            profile: Perfil,
            presidentMandate: VencimientoMandato || null,
            isActive: Activo === "SI" ? "SI" : "NO",
          });
        }

        await dealer.save();
      }
    }

    console.log("Procesamiento completado exitosamente.");
  } catch (error) {
    console.error("Error en abmDealers:", error.message);
    throw error;
  }
};