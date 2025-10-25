import { NextFunction, Request, Response } from "express";
import { getIpAddress } from "../utils/file-sahring";
import { appConfig } from "../common/config/app-config";
import { ForbiddenException } from "../exception/forbidden-exception";

// Authorized ownner by ip address
export const authorize = (req: Request, res: Response, next: NextFunction) => {
    try {
        const ip = getIpAddress(req);
        if (ip !== appConfig.OWNNER_IP) {
            return next(new ForbiddenException(`You are not authorized to perform this action`));
        }
        // Pass into next middleware
        return next();
    } catch (error) {
        return next(error);
    }

};