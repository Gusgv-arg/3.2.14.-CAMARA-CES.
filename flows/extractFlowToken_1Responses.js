
export const extractFlowToken_1Responses = async (flowMessage) => {
	// Paso del formato json a string
	//flowMessage = JSON.stringify(flowMessage) // descomentar en localhost

	// Función que retorna este objeto
	let response = {option: ""};
	
	console.log("Lo que viene del Flow1:", flowMessage);
	
	// Extraer la opción seleccionada por el Admin
	
	return response;
};
/* extractFlowToken_1Responses('{"Seleccionar lo que corresponda":["Efectivo, Transferencia o Tarjeta de D\\u00e9bito"],"Motomel":"MAX 110 A\\/E","Benelli":"Leoncino 500 (todas AM2022)","Keeway":"KEEWAY K-Light 202","Teknial":"TK-REVOLT","flow_token":"1"}') */
/* extractFlowToken_1Responses(
	'{"Seleccionar lo que corresponda":["Efectivo, Transferencia o Tarjeta de D\\u00e9bito"],"No s\\u00e9":"No s\\u00e9","flow_token":"1"}'
); */
