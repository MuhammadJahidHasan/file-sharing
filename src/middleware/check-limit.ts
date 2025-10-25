import { NextFunction, Request, Response } from "express";
import { BadRequestException } from "../exception/bad-request-exception";
import { getIpAddress, isToday } from "../utils/file-sahring";
import { DOWNLOADS, DOWNLOAD_LIMIT, UPLOADS, UPLOAD_LIMIT } from "../common/constants/file-shareing-constant";

// Need to be confugure in redis or any database system
const limit: any = {};
// Check daily uploads and download limit for a user track via ip address
export const checkLimit = (type: string) => {

    return (req: Request, res: Response, next: NextFunction) => {
        
        try {
            const ip = getIpAddress(req);
            const today = new Date();
            // If new user or another day, then reset
            if (!limit[ip] || !isToday(limit[ip].date)) {
                limit[ip] = {
                    date: today,
                    uploads: type === UPLOADS ? 1 : 0,
                    downloads: type === DOWNLOADS ? 1 : 0
                }

                return next();
            }
            // Throw error if upload limit is cross
            if (type === UPLOADS && limit[ip].uploads > UPLOAD_LIMIT) {
                return next(new BadRequestException(`You cross the uploads limit`));
            }
            // Throw error if downloads limit is cross
            if (type === DOWNLOADS && limit[ip].downloads > DOWNLOAD_LIMIT) {
                return next(new BadRequestException(`You cross the downloads limit`));
            }
            
            // Increase limit
            limit[ip][type]++;
            return next();

        } catch (error) {
            return next(error);
        }

    }

}