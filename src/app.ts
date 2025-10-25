import express from 'express';
import { getLocalStorageServiceInstant } from './service/local-storage';
import { getFileSharingControllerInstance } from './controller/file-sharing';
import { getRouter } from './router';
import { getLocaDbInstance } from './database/local-db';
import { globalErrorHandler } from './middleware/global-error-handler';
import { getFileCleanupServiceInstance } from './service/file-cleanup-cron';
import { SCHEDULER_TIME_INTERVAL_IN_SEC } from './common/constants/file-shareing-constant';

const app = express();

app.use(express.json());

// bootstrapping the application
(async () => {

    // initializing Repos
    const locaDbService = await getLocaDbInstance();

    // initializing services
    const localStorageService = await getLocalStorageServiceInstant(locaDbService);

    // // initializing controllers
    const fileSharingController = await getFileSharingControllerInstance(localStorageService);

    const fileCleanUpCron = await getFileCleanupServiceInstance(locaDbService);

    // File cleanup scheduler that run a certain time interval
    setInterval(async () => {
        await fileCleanUpCron.startCorn()

    }, SCHEDULER_TIME_INTERVAL_IN_SEC * 1000)

    // //initialize routers
    const router = await getRouter(fileSharingController);

    app.use("/api", router);

    // Global error handler, all error handled form a single space
    app.use(globalErrorHandler);

})();

export default app;
