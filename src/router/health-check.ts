import { Router } from "express";

export const getHealthRouter = async (): Promise<Router> => {
    const healthRouter = Router();

    healthRouter.get("/", (req, res) => {
        return res.status(200).send({
            code: "SUCCESS",
            message: "Welcome to coupon service",
            response: null,
            error: null
        });
    });

    return healthRouter;
};