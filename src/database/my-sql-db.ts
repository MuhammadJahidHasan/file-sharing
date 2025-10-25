
import { IDbService } from './db.interface';

// Not implemented yet, When we need to save mysql database instead of local db then impplemented and changed dependencies for app layer
export class MySqlDbService implements IDbService {

    constructor() {}

    async saveFile(data: any): Promise<any> {
        throw new Error(`Method not implemented`);
    }

    async getFile(publicKey: string): Promise<any> {
        throw new Error(`Method not implemented`);
    }

    async getFileByName(filename: string): Promise<any> {
        throw new Error(`Method not implemented`);
    }

    async getExistingFile(filename: string, mimetype: string, ip: string): Promise<any> {
        throw new Error(`Method not implemented`);
    }

    async updateFile(publicKey: string, updatesData: any) {
        throw new Error(`Method not implemented`);
    }
      
    async deleteFile(privateKey: string): Promise<any> {
        throw new Error(`Method not implemented`);
    }

    deleteUploadedFile(dirName: string, fileName: string) {
        throw new Error(`Method not implemented`);
    }
}

export const getMysqlDbInstance = async (): Promise<IDbService> => {
    return await new MySqlDbService();
}  