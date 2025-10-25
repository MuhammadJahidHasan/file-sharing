import { NextFunction, Request, Response } from "express";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { appConfig } from "../common/config/app-config";
import { BadRequestException } from "../exception/bad-request-exception";
import { getIpAddress } from "../utils/file-sahring";
import { ALLOWED_FILE_TYPES, FILE_SIZE_IN_MB } from "../common/constants/file-shareing-constant";

// Use multer for upload file, Express js provide this

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create folder if not exists
        const folder = path.join(process.cwd(), appConfig.FOLDER);
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }

        cb(null, folder);
    },
    // Configure filename
    filename: (req, file, cb) => {
        const extName = path.extname(file.originalname);
        const ip = getIpAddress(req);
        const fileName = file.originalname.replace(extName, '').toLowerCase().split(' ').join('-') + '-' + ip
        cb(null, fileName + extName);
    },
});


const fileFilter = (req: any, file: any, cb: any) => {
    // Accept only this type of file
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        return cb(new Error('This file format is not supported'), false);
    }
    cb(null, true);
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: FILE_SIZE_IN_MB * 1024 * 1024 }, // In Mb
});

export const uploadFile = (fieldName: string) => {

    return (req: Request, res: Response, next: NextFunction) => {

        try {
            // Upload only single file
            const uploder = upload.single(fieldName);

            uploder(req, res, (err) => {
                if (err) {
                    console.log(`Error form multer file uploader`);
                    return next(new BadRequestException(`Failed to upload file`));
                }

                if (!req.file) {
                    return next(new BadRequestException(`No file uploaded`));
                }
                return next();
            })

        } catch (error) {
            return next(error);
        }

    }
}