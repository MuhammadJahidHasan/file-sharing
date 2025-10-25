import { Request,  Response} from "express";
import fs from 'fs';
import { getIpAddress } from "../utils/file-sahring";
import { IFileStorageService } from "../service/file-storage.interface";

export class FileSharingController {
    private readonly fileStorageServie
    constructor(fileStorageServie: IFileStorageService) {
        // Initialize dependencies
        this.fileStorageServie = fileStorageServie;
        // Bind method
        this.upload = this.upload.bind(this);
        this.get = this.get.bind(this);
        this.delete = this.delete.bind(this);
    }

    async upload(req: Request, res: Response) {
        // Get Ip address form a utill function
        const ip = getIpAddress(req);
        // Call service layer
        const data = await this.fileStorageServie.upload(req.file, ip);
        sendResonse(res, 200, data,)
    }

    async get(req: Request, res: Response) {
        const { publicKey } = req.params;
        const { filePath, mimetype } = await this.fileStorageServie.getFile(publicKey);

        // Return steam with mimetype
        const stream = fs.createReadStream(filePath);
        res.setHeader('Content-Type', mimetype);
        return stream.pipe(res);
    }

    async delete(req: Request, res: Response) {
        const { privateKey } = req.params;
        const data = await this.fileStorageServie.delete(privateKey);
        sendResonse(res, 200, data, 'Successfully deleted file');
    }
}

// Get file sharing controller instance
export const getFileSharingControllerInstance = async(fileStorageServie: IFileStorageService) => {
    return await new FileSharingController(fileStorageServie);

}

const sendResonse = (res: Response, statusCode: number, data: any, message?: string) => {
    const resMessage = message || data.message || 'success';

    let finalResponse = null
    if (data && data.message) {
        const { message, ...rest } = data;
        finalResponse = rest
    } else {
        finalResponse = data || null;
    }
    return res.status(statusCode).send({
        message: resMessage,
        data: finalResponse
    })

}