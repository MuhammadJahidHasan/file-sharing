import { Router } from "express";
import { FileSharingController } from "../controller/file-sharing";
import { getHealthRouter } from "./health-check";
import { getFileSharingRouter } from "./file-sharing";

export const getRouter = async (fileSharingController: FileSharingController): Promise<Router> => {
    const router = Router();
    router.use("/health", await getHealthRouter());
    router.use("/files", await getFileSharingRouter(fileSharingController));

    // router.use("*", (req, res) => {
    //     res.status(404).send({
    //         message: "Resource not found, please hit the correct end point",
    //         data: null,
    //     
    //     });
    // });

    return router;
};
