import { Request, Response, NextFunction } from "express";

// Global error handler middleware, hanlde and send respose form a single space
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`Error caught by global handler`, err);
    // Check custom err, it means our app knowm error, otherwise customer may get actual error 
    // message for unexpected unknown error as sometimes many thid party library may throw bad request error
    const statusCode = err.isCustomError ? err.statusCode : 500;
    const errorMessage = statusCode === 500 || !err.message ? 'Internal Server Error' : err.message;

    return res.status(statusCode).send({
        message: errorMessage,
        data: null,
        errors: err.isCustomError && err.errors ? err.errors : [errorMessage],
    });
};
