import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateExtractedDataDto } from './dto/update-document.dto';
import { DocumentType } from '../../database/entities/document.entity';

import * as os from 'os';

const getUploadDir = () => {
  const dir = process.env.VERCEL
    ? os.tmpdir()
    : path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (e) {}
  }
  return dir;
};

// Configure Multer storage matching File 3 (server.js)
const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadDir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

@Controller('api/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/jpg',
          'application/pdf',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Unsupported file format. Please upload JPG, PNG, WEBP, or PDF.',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.documentsService.processDocumentUpload(file, dto.documentType);
  }

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('documentType') documentType?: DocumentType,
    @Query('search') search?: string,
  ) {
    return this.documentsService.findAll(
      parseInt(page, 10),
      parseInt(limit, 10),
      documentType,
      search,
    );
  }

  @Get('stats/summary')
  async getStats() {
    return this.documentsService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateExtractedDataDto,
  ) {
    return this.documentsService.updateExtractedData(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }

  @Get('file/:filename')
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const tmpDir = os.tmpdir();
    const pTmp = path.join(tmpDir, filename);
    const pUpload = path.join(process.cwd(), 'uploads', filename);
    const pProcessed = path.join(process.cwd(), 'processed', filename);

    if (fs.existsSync(pTmp)) {
      return res.sendFile(pTmp);
    } else if (fs.existsSync(pUpload)) {
      return res.sendFile(pUpload);
    } else if (fs.existsSync(pProcessed)) {
      return res.sendFile(pProcessed);
    }

    throw new NotFoundException('File not found');
  }
}
