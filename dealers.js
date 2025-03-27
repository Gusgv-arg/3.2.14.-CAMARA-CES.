const dealers = [
	{
		brand: "", // [Peugeot, Citroen, DS, Fiat, Jeep, Ram, ...]
		dealers: [
			{
				name: "",
				code: "",
				address: "",
				province: "",
				cuit: "",
				iaActive: true,
				employees: [
					{
						name: "",
						category: [], // [Accionista, General, Ventas, Postventa, Planes, Administración, Calidad,...]
						phone: "",
						mail: "",
						isActive: true,
						history: [
							{
								docsSent: [
									{
										type: "", // [Minuta, Información, Encuesta, ...]
										area: "", // [General, Ventas, Postventa, Planes, Administración, Calidad, Red, ...]
										name: "",
										channel: "", // [WhatsApp, Mail]
										status: "", // [Enviado, Recibido, Leído, Error, Respuesta]
										statusDate: "",
									},
								],
							},
						],
					},
				],
			},
		],
	},
];
