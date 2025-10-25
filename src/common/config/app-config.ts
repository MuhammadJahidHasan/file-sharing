
export interface IAppConfig {
    PORT: string;
    FOLDER: string;
    DATABASE_FOLDER: string;
    DATABASE_FILE: string;
    OWNNER_IP: string;
}

export const appConfig: IAppConfig = {
    PORT: process.env.PORT || "3000",
    FOLDER: process.env.FOLDER || "uploads",
    DATABASE_FOLDER: process.env.DATABASE_FOLDER || "data",
    DATABASE_FILE: process.env.DATABASE_FILE || "data.json",
    OWNNER_IP: process.env.OWNNER_IP || "127.0.0.1"
} 