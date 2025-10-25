import { Request, Response, NextFunction } from "express";

// This will wrap any async controller to catch errors and pass to next so that all error can be
// handled from global error hanlder, exta try/catch not needed in controller layer
export const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next); // Catch any thrown error and pass to next
};
