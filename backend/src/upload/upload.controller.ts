import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join('/app/uploads'), // Путь внутри контейнера
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file) {
    if (!file) {
      return { error: 'No file uploaded' };
    }
    const filePath = `uploads/${file.filename}`; // Путь относительно корня сервера
    const fileUrl = `${process.env.HOST}/${filePath}`; // Полный URL

    return {
      originalname: file.originalname,
      filename: file.filename,
      path: fileUrl,
    };
  }
}
