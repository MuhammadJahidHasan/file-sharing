import fs from 'fs';
import path from 'path';
import { IDbService } from '../../src/database/db.interface';
import { IFileStorageService } from '../../src/service/file-storage.interface';
import { generatePrivateKey, generatePublicKey } from '../../src/utils/file-sahring';
import { getLocalStorageServiceInstant } from '../../src/service/local-storage';
import { appConfig } from '../../src/common/config/app-config';
import { BadRequestException } from '../../src/exception/bad-request-exception';

jest.mock('fs');
jest.mock('path');
jest.mock('../../src/utils/file-sahring', () => ({
  generatePublicKey: jest.fn(),
  generatePrivateKey: jest.fn(),
}));

describe('LocalStorageService', () => {
  let locaDbService: IDbService;
  let localStorageService: IFileStorageService;

  const mockFile = {
    filename: 'bike.png',
    originalname: 'bike.png',
    mimetype: 'image/png',
    size: 100,
  };

  beforeEach(async () => {
    locaDbService = {
      saveFile: jest.fn(),
      getFile: jest.fn(),
      getFileByName: jest.fn(),
      getExistingFile: jest.fn(),
      updateFile: jest.fn(),
      deleteUploadedFile: jest.fn(),
      deleteFile: jest.fn(),
    };
    (generatePublicKey as jest.Mock).mockReturnValue('publicKey');
    (generatePrivateKey as jest.Mock).mockReturnValue('privateKey');

    (path.join as unknown as jest.Mock).mockImplementation((...args) => args.join('/'));


    localStorageService = await getLocalStorageServiceInstant(locaDbService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Upload file', () => {
    test('Should upload a new file', async () => {
     (locaDbService.getExistingFile as jest.Mock).mockResolvedValue(null);

      const result = await localStorageService.upload(mockFile, '127.0.0.1');

      expect(locaDbService.getExistingFile).toHaveBeenCalled();
      expect(locaDbService.saveFile).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Successfully uploaded file',
        publicKey: 'publicKey',
        privateKey: 'privateKey',
      });
    });

    test('Should update if file already exists', async () => {
      const existingFile = { publicKey: 'existingPubKey', privateKey: 'existingPrivateKey' };
      (locaDbService.getExistingFile as jest.Mock).mockResolvedValue(existingFile);

      const result = await localStorageService.upload(mockFile, '127.0.0.1');

      expect(locaDbService.updateFile).toHaveBeenCalledWith('existingPubKey', expect.any(Object));
      expect(result).toEqual({
        message: 'Successfully Updated file',
        publicKey: 'existingPubKey',
        privateKey: 'existingPrivateKey',
      });
    });

    test('Should delete if save file in database', async () => {
      (locaDbService.getExistingFile as jest.Mock).mockResolvedValue(null);
      (locaDbService.saveFile as jest.Mock).mockRejectedValue(new Error('Failed to save database'));

      await expect(localStorageService.upload(mockFile, '127.0.0.1')).rejects.toThrow('Failed to save database');
      expect(locaDbService.deleteUploadedFile).toHaveBeenCalled();
    });
  });

  describe('Get file', () => {
    test('Should return the file path and mimetype', async () => {
      (locaDbService.getFile as jest.Mock).mockResolvedValue({ filename: 'bike.png', mimetype: 'image/png' });
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = await localStorageService.getFile('publicKey');

      expect(result).toEqual({
        filePath: `${process.cwd()}/${appConfig.FOLDER}/bike.png`,
        mimetype: 'image/png',
      });
    });

    test('Should throw an error if file not found in database', async () => {
      await (locaDbService.getFile as jest.Mock).mockResolvedValue(null);
      await expect(localStorageService.getFile('missing')).rejects.toThrow(BadRequestException);
    });

    test('Should throw an error if file path not exists', async () => {
      (locaDbService.getFile as jest.Mock).mockResolvedValue({ filename: 'bike.png', mimetype: 'image/png' });
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(localStorageService.getFile('publicKey')).rejects.toThrow(BadRequestException);
    });
  });

  describe('Delete file', () => {
    test('Should delete file successfully', async () => {
      (locaDbService.deleteFile as jest.Mock).mockResolvedValue({ success: true });

      const result = await localStorageService.delete('privateKey');

      expect(locaDbService.deleteFile).toHaveBeenCalledWith('privateKey');
      expect(result).toEqual({ success: true });
    });
  });
});
