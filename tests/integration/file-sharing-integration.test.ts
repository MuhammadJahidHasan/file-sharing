import request from 'supertest';
import express from 'express';
import { FileSharingController } from '../../src/controller/file-sharing';
import { getFileSharingRouter } from '../../src/router/file-sharing';
import { PassThrough } from 'stream';


describe('FileSharing Router Integration', () => {
  let app: express.Express;
  let fileStorageServiceMock: any;

  beforeAll(async () => {
    fileStorageServiceMock = {
      upload: jest.fn(),
      getFile: jest.fn(),
      delete: jest.fn(),
    };

    const fileSharingController = new FileSharingController(fileStorageServiceMock);

    // Build express app
    app = express();
    app.use(express.json());

    // Use router 
    const router = await getFileSharingRouter(fileSharingController);
    app.use('/files', router);

    // Error handler
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.status(err.status || 500).send({ message: err.message });
    });
  });

  test('POST /files should upload file', async () => {
    fileStorageServiceMock.upload.mockResolvedValue({
      message: 'Successfully uploaded file',
      publicKey: 'pub123',
      privateKey: 'pri567',
    });

    const res = await request(app)
      .post('/files')
      .attach('file', Buffer.from('dummy'), 'bike.png'); // attach dummy file

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Successfully uploaded file',
      data: { publicKey: 'pub123', privateKey: 'pri567' },
    });
    expect(fileStorageServiceMock.upload).toHaveBeenCalled();
  });


  test('GET /files/:publicKey should stream file', async () => {
    const streamMock = new PassThrough();
    jest.spyOn(require('fs'), 'createReadStream').mockReturnValue(streamMock);

    fileStorageServiceMock.getFile.mockResolvedValue({
      filePath: '/tmp/bike.png',
      mimetype: 'image/png',
    });

    const req = request(app).get('/files/pub123');

    setImmediate(() => {
      streamMock.write('dummy file content');
      streamMock.end();
    });

    const res = await req;
    expect(res.status).toBe(200);
    expect(fileStorageServiceMock.getFile).toHaveBeenCalledWith('pub123');
    expect(res.type).toBe('image/png');
  });


  test('DELETE /files/:privateKey should delete file', async () => {
    fileStorageServiceMock.delete.mockResolvedValue({ success: true });

    const res = await request(app).delete('/files/priv123');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Successfully deleted file',
      data: { success: true },
    });
    expect(fileStorageServiceMock.delete).toHaveBeenCalledWith('priv123');
  });
});

