import fs from 'fs';
import path from 'path';
import { appConfig } from '../common/config/app-config';
import { FILE_INACTIVITY_LIMIT_IN_MINUTES } from '../common/constants/file-shareing-constant';
import { IDbService } from '../database/db.interface';

const FOLDER = appConfig.FOLDER;
// Scheduler for clean file that inactive for certiain(configurable) moment 
export class FileCleanupCronService {
    constructor(private readonly localDbService: IDbService) {}

    async startCorn() {
        // Retun if folder not exists
        if (!fs.existsSync(FOLDER)) {
            console.log('Upload directory not found ');
            return;
        }

        console.log('Start cleanup job at', new Date().toISOString());
        // Get all file form folder
        const files = fs.readdirSync(FOLDER);
        if (!files.length) {
            console.log('No file found');
            return
        }

        const now = Date.now();
        const inactivityLimitInMs = FILE_INACTIVITY_LIMIT_IN_MINUTES * 60 * 1000;

        for (const filename of files) {
            const filePath = path.join(FOLDER, filename);
            try {
                const fileStats = fs.statSync(filePath);
                // Calculate file inactivition time
                const lastActiveTime = Math.max(fileStats.atimeMs, fileStats.mtimeMs);
                const inactiveDuration = now - lastActiveTime;

                // Check file inactivition time
                if (inactiveDuration > inactivityLimitInMs) {
                    // Delete file
                    const file = await this.localDbService.getFileByName(filename)
                    await this.localDbService.deleteFile(file.privateKey);
                    console.log(`Deleted file-${filename}`);
                }

            } catch (error) {
                 console.log(`Error from cron while deleting file`, filename);
            }

        }

        console.log('Finished cleanup job at', new Date().toISOString());

    }
}

export const getFileCleanupServiceInstance = (localDbService: IDbService) => {
       return new FileCleanupCronService(localDbService);
}
