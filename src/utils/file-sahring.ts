import crypto from 'crypto';
import { Request } from 'express'

// Generate random 8 char public key
export const generatePublicKey = () => {
    return crypto.randomBytes(8).toString('hex');
}

// Generate random 8 char private key
export const generatePrivateKey = () => {
    return crypto.randomBytes(8).toString('hex');
}

// Get ip address 
export const getIpAddress = (req: Request) => {
    const reqHeaders = req.headers;
    let clientIp = "";

    if (reqHeaders["x-original-forwarded-for"]) {
        clientIp = reqHeaders["x-original-forwarded-for"] as string;
    } else if (reqHeaders["x-forwarded-for"]) {
        clientIp = reqHeaders["x-forwarded-for"] as string;
    } else {
        clientIp = req.ip as string;
    }

    clientIp = clientIp.replace("::ffff:", "");
    return clientIp;
}

// Check date is today or not not
export const isToday = (date: any) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }
  