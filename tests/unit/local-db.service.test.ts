import fs from 'fs';
import path from 'path';
import { IDbService } from '../../src/database/db.interface';
import { appConfig } from '../../src/common/config/app-config';
import { getLocaDbInstance } from '../../src/database/local-db';
import { BadRequestException } from '../../src/exception/bad-request-exception';


jest.mock('fs');
jest.mock('path');

describe('LocaDbService', () => {
  let locaDbService: IDbService;

  beforeEach(async () => {
    jest.clearAllMocks();

    (path.join as unknown as jest.Mock).mockImplementation((...args) => args.join('/'));

    (fs.existsSync as jest.Mock).mockImplementation((filePath: string) => {
      if (!filePath) return false;
      if (filePath.includes(appConfig.DATABASE_FOLDER)) return true;
      return false;
    });

    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
    (fs.readFileSync as jest.Mock).mockImplementation(() => '[]');

    locaDbService = await getLocaDbInstance();
  });

  describe('Save file', () => {
    test('Should read, push, and write new file data', async () => {
      const data = { name: 'file1' };
      const mockRead = jest.spyOn<any, any>(locaDbService, 'readDB').mockReturnValue([]);
      const mockWrite = jest.spyOn<any, any>(locaDbService, 'writeDB').mockImplementation(() => {});

      await locaDbService.saveFile(data);

      expect(mockRead).toHaveBeenCalled();
      expect(mockWrite).toHaveBeenCalledWith(expect.any(String), [data]);
    });
  });

  describe('Get file', () => {
    test('Should return file if match', async () => {
      const mockData = [{ publicKey: 'jfhue58643KJHF', filename: 'bike.png' }];
      jest.spyOn<any, any>(locaDbService, 'readDB').mockReturnValue(mockData);

      const result = await locaDbService.getFile('jfhue58643KJHF');
      expect(result).toEqual(mockData[0]);
    });
  });

  describe('Get File ByName', () => {
    test('Should return file by name', async () => {
      const mockData = [{ filename: 'bike.png' }];
      jest.spyOn<any, any>(locaDbService, 'readDB').mockReturnValue(mockData);

      const result = await locaDbService.getFileByName('bike.png');
      expect(result).toEqual(mockData[0]);
    });
  });

  describe('getExistingFile', () => {
    test('should return matching existing file by filename, mimetype, ip', async () => {
      const mockData = [{ filename: 'a.txt', mimetype: 'text', ownerIp: '127.0.0.1' }];
      jest.spyOn<any, any>(locaDbService, 'readDB').mockReturnValue(mockData);

      const result = await locaDbService.getExistingFile('a.txt', 'text', '127.0.0.1');
      expect(result).toEqual(mockData[0]);
    });
  });

  describe('updateFile', () => {
    test('should update file and write updated data', async () => {
      const mockData = [{ publicKey: 'key1', name: 'old' }];
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockData));

      await locaDbService.updateFile('key1', { name: 'new' });

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining(appConfig.DATABASE_FILE),
        expect.stringContaining('"name": "new"'),
        'utf8'
      );
    });
  });

  describe('Delete File', () => {
    test('Should throw if private key not found', async () => {
      jest.spyOn<any, any>(locaDbService, 'readDB').mockReturnValue([]);

      await expect(locaDbService.deleteFile('missing')).rejects.toThrow(BadRequestException);
    });
  });

  describe('Delete Uploaded file', () => {
    test('Should delete file', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      locaDbService.deleteUploadedFile(`/${appConfig.FOLDER}`, 'bike.png');

      expect(fs.unlinkSync).toHaveBeenCalledWith(`/${appConfig.FOLDER}/bike.png`);
    });

  });

  describe('Read database', () => {
    test('Should return parsed JSON content', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('[{"a":1}]');

      const result = (locaDbService as any).readDB('mockPath');
      expect(result).toEqual([{ a: 1 }]);
    });

    test('Should return [] if file empty', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue('  ');
      const result = (locaDbService as any).readDB('mockPath');
      expect(result).toEqual([]);
    });

    test('should return [] if file not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const result = (locaDbService as any).readDB('mockPath');
      expect(result).toEqual([]);
    });
  });

  describe('Write database', () => {
    test('should write JSON to file', () => {
      (locaDbService as any).writeDB('mockPath', [{ a: 1 }]);
      expect(fs.writeFileSync).toHaveBeenCalledWith('mockPath', JSON.stringify([{ a: 1 }], null, 2));
    });
  });
});
