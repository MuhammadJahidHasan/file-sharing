import { IFileStorageService } from "./file-storage.interface";

// This is not implmented, If application need to save cloud storage instead of local storage 
// then implement this and chaged to dependecies from top(application initialize layer).
export class CloudStorageService implements IFileStorageService {
    constructor() {}

    async upload(): Promise<any> {
       throw new Error(`Method not implemented`);
    }

    async getFile(publicKey: string): Promise<any> {
       throw new Error(`Method not implemented`);
    }

    async delete(privateKey: string): Promise<any> {
       throw new Error(`Method not implemented`); 
    }
}

export const getLocalStorageServiceInstant = async(): Promise<IFileStorageService> => {
    return await new CloudStorageService();
}