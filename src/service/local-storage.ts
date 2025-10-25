import fs from 'fs';
import path from 'path';
import { generatePrivateKey, generatePublicKey } from '../utils/file-sahring';
import { BadRequestException } from '../exception/bad-request-exception';
import { appConfig } from '../common/config/app-config';
import { IFileStorageService } from './file-storage.interface';
import { IDbService } from '../database/db.interface';

export class LocalStorageService implements IFileStorageService {
    constructor(private readonly locaDbService: IDbService) { }

    async upload(file: any, ip: string): Promise<any> {

        try {
            // Rady file data
            const fileData = {
                filename: file.filename,
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                ownerIp: ip,
                publicKey: generatePublicKey(),
                privateKey: generatePrivateKey(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }

            // IF already exists the same file with same foramt, then the file should be replaced
            const existingFile = await this.locaDbService.getExistingFile(fileData.filename, fileData.mimetype, ip);
            if (existingFile) {
                const updatesData = {
                    updatedAt: new Date().toISOString(),
                }
                await this.locaDbService.updateFile(existingFile.publicKey, updatesData);
                return {
                    message: `Successfully Updated file`,
                    publicKey: existingFile.publicKey,
                    privateKey: existingFile.privateKey
                };
            }
            // Save into database
            await this.locaDbService.saveFile(fileData);

            return {
                message: `Successfully uploaded file`,
                publicKey: fileData.publicKey,
                privateKey: fileData.privateKey
            };

        } catch (error) {
            // If failed to save data in databse then file will be deleted to avoid inconsistency
            this.locaDbService.deleteUploadedFile(path.join(process.cwd(), appConfig.FOLDER), file.filename);
            throw error;
        }
    }

    async getFile(publicKey: string): Promise<any> {
        // Get file from local storage 
        const data = await this.locaDbService.getFile(publicKey);
        if (!data) {
            throw new BadRequestException(`No file found provided by key`);
        }
        // Get upload dir
        const uploadDir = path.join(process.cwd(), appConfig.FOLDER);
        
        // Get file path
        const filePath = path.join(uploadDir, data.filename);

        // Throw exception if file not exists
        if (!fs.existsSync(filePath)) {
            throw new BadRequestException(`File path not found`);
        }

        return { filePath, mimetype: data.mimetype };
    }

    async delete(privateKey: string): Promise<any> {
        return this.locaDbService.deleteFile(privateKey);
    }

}
// Get local storage service instnace
export const getLocalStorageServiceInstant = async (locaDbService: IDbService): Promise<IFileStorageService> => {
    return await new LocalStorageService(locaDbService);

}