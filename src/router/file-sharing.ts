import { Router } from "express";
import { FileSharingController } from "../controller/file-sharing";
import { uploadFile } from "../middleware/upload-file";
import { asyncHandler } from "../middleware/async-hander";
import { checkLimit } from "../middleware/check-limit";
import { DOWNLOADS, FILE_UPLOAD_FIELD_NAME, UPLOADS } from "../common/constants/file-shareing-constant";
import { authorize } from "../middleware/authorize";

export const getFileSharingRouter = async (fileSharingController: FileSharingController): Promise<Router> => {
    const fileShare = Router();

    fileShare.post("/", authorize, checkLimit(UPLOADS), uploadFile(FILE_UPLOAD_FIELD_NAME), asyncHandler(fileSharingController.upload));
    fileShare.get("/:publicKey", checkLimit(DOWNLOADS), asyncHandler(fileSharingController.get));
    fileShare.delete("/:privateKey", authorize, asyncHandler(fileSharingController.delete));

    return fileShare;
};