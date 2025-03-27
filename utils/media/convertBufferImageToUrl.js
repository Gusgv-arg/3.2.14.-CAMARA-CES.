import { fileTypeFromBuffer } from "file-type";
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

export const convertBufferImageToUrl = async (imageBufferData, baseUrl) => {
    if (!imageBufferData) return null;
    if (!baseUrl) throw new Error("Base URL is required");

    try {
        const fileType = await fileTypeFromBuffer(imageBufferData);
        if (!fileType) {
            throw new Error("Unsupported file type");
        }

        const fileName = `${uuidv4()}.${fileType.ext}`;
        const publicDir = path.join(process.cwd(), 'public', 'temp');
        await fs.mkdir(publicDir, { recursive: true });
        const filePath = path.join(publicDir, fileName);
        
        await fs.writeFile(filePath, imageBufferData);

        // Verificar que el archivo se haya creado
        const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
        if (!fileExists) {
            throw new Error("Failed to save the file");
        }

        //console.log(`File saved at: ${filePath}`);

        // Construir la URL completa
        return new URL(`/temp/${fileName}`, baseUrl).toString();

    } catch (error) {
        console.log("Error in convertBufferImageToUrl:", error.message);
        throw error;
    }
};