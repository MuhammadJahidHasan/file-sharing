/*
Using a file storage interface allows us to encapsulate the actual implementation details 
and keep the code loosely coupled. This way, if we change the underlying storage mechanism 
for example, switching from local storage databse to mysql database the service layer remains unaffected
*/
export interface IDbService {
    saveFile(data: any): Promise<any>;
    getFile(publicKey: string): Promise<any>;
    getFileByName(filename: string): Promise<any>;
    getExistingFile(filename: string, mimetype: string, ip: string): Promise<any>;
    updateFile(publicKey: string, updatesData: any):  Promise<any>
    deleteFile(privateKey: string): Promise<any>;
    deleteUploadedFile(dirName: string, fileName: string): any
}