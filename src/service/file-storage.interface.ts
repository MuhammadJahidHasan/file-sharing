/*
Using a file storage interface allows us to encapsulate the actual implementation details 
and keep the code loosely coupled. This way, if we change the underlying storage mechanism 
for example, switching from local storage to cloud storage the controller layer remains unaffected
*/ 
export interface IFileStorageService {
    upload(file: any, ip: string): Promise<any>;
    getFile(publicKey: string): Promise<any>;
    delete(privateKey: string): Promise<any>;
}