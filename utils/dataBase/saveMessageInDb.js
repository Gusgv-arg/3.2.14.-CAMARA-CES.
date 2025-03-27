
export const saveMessageInDb = async (
	senderId,
	messageGpt,
	threadId,
	newMessage,
	campaignFlag
) => {
	// Save the sent message to the database
	try {
		
		
			
	} catch (error) {
		const errorMessage = error?.response?.data
		? JSON.stringify(error.response.data)
		: error.message

		logError(errorMessage, "An error occured while saving message in Messages DB");
		throw new Error(errorMessage);
	}
};
