import Dealers from "../../models/dealers.js";

export const updatePhoneStatus = async (chequedPhones) => {
    try {
        // Obtener todos los dealers
        const dealers = await Dealers.find({});
        
        for (const dealer of dealers) {
            let hasUpdates = false;
            
            // Revisar cada empleado del dealer
            dealer.employees.forEach(employee => {
                // Buscar si el teléfono del empleado está en chequedPhones
                const phoneCheck = chequedPhones.find(check => check.phone === employee.phone);
                
                if (phoneCheck) {
                    employee.phoneOk = phoneCheck.phoneOk;
                    hasUpdates = true;
                }
            });
            
            // Guardar solo si hubo actualizaciones en este dealer
            if (hasUpdates) {
                await dealer.save();
            }
        }

        return true;
    } catch (error) {
        console.error("Error updating phone status:", error);
        throw error;
    }
};