import fs from 'fs';
import path from 'path';
import { appConfig } from '../common/config/app-config';
import { BadRequestException } from '../exception/bad-request-exception';
import { IDbService } from './db.interface';

// Get local database dir
const dataDir = path.join(process.cwd(), appConfig.DATABASE_FOLDER);

export class LocaDbService implements IDbService {

    private readonly dbPath: string;

    constructor() {
        // Get local database full path
        this.dbPath = path.join(dataDir, appConfig.DATABASE_FILE);
        // Create path during the app initialize if not exists
        this.createDirIfNotExists();
    }

    private createDirIfNotExists() {
        // Create dir if not found
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        // Insert empty array if file not exists
        if (!fs.existsSync(this.dbPath)) {
            fs.writeFileSync(this.dbPath, '[]');
        }
    }

    async saveFile(data: any): Promise<any> {
        const dbPath = this.dbPath;
        // Get database existing data
        const db = this.readDB(dbPath);
        // Push new data
        db.push(data);
        // Save updated full data
        this.writeDB(dbPath, db);
    }

    async getFile(publicKey: string): Promise<any> {

        const dbPath = this.dbPath;
        const db = this.readDB(dbPath);
        // Check public key is correct 
        const data = db.find((d: any) => d.publicKey === publicKey);
        return data;
    }

    async getFileByName(filename: string): Promise<any> {
        const dbPath = this.dbPath;
        const db = this.readDB(dbPath);
        // Retrieve data by filename
        const data = db.find((d: any) => d.filename === filename);
        return data;
    }

    async getExistingFile(filename: string, mimetype: string, ip: string): Promise<any> {

        const dbPath = this.dbPath;
        const db = this.readDB(dbPath);
        // Get existing file, If same ownner same mimetpe upload this file
        const data = db.find((d: any) => d.filename === filename && d.mimetype === mimetype && d.ownerIp === ip);
        return data;
    }

    async updateFile(publicKey: string, updatesData: any) {

        const dbPath = this.dbPath;
        // Get file data
        const content = fs.readFileSync(dbPath, 'utf8');

        const data = JSON.parse(content);
    
        // Get updated data 
        const updatedData = data.map((data: any) =>
          data.publicKey === publicKey ? { ...data, ...updatesData } : data
        );
        // Finally save full data with updated
        fs.writeFileSync(dbPath, JSON.stringify(updatedData, null, 2), 'utf8');
    
      }
      

    async deleteFile(privateKey: string): Promise<any> {
        const dbPath = this.dbPath;
        const db = this.readDB(dbPath);
        // Retive file by private key as file can not be deleted without private key
        const fileExist = db.find((d: any) => d.privateKey === privateKey);
        // Throw error if file not exists
        if (!fileExist) {
            throw new BadRequestException(`File not found provided by key`);
        }
        const uploadDir = path.join(process.cwd(), appConfig.FOLDER);
        // Delete file form uploaded dir
        this.deleteUploadedFile(uploadDir, fileExist.filename);
        // Delete file for database also
        // TODO: Need tranasction for data consistency
        const data = db.filter((d: any) => d.privateKey !== privateKey);
        this.writeDB(dbPath, data);
    }
    
    // Get database content
    private readDB(dbPath: string) {
        if (!fs.existsSync(dbPath)) return [];
        const content = fs.readFileSync(dbPath, 'utf8').trim();
        if (!content) return [];
        return JSON.parse(content);
    }
    // Save content
    private writeDB(dbPath: string, data: any) {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    }

    deleteUploadedFile(dirName: string, fileName: string) {
        const filePath = path.join(dirName, fileName);
        if (!fs.existsSync(filePath)) {
            throw new BadRequestException(`File not found`);
        }
        fs.unlinkSync(filePath);
        return;
    }
}

export const getLocaDbInstance = async (): Promise<IDbService> => {
    return await new LocaDbService();
}  