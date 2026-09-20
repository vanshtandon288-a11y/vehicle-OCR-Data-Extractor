import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ProcessedDocument } from '../database/entities/document.entity';
import { ExtractedData } from '../database/entities/extracted-data.entity';

import * as os from 'os';
import * as path from 'path';

export const getTypeOrmConfig = (): TypeOrmModuleOptions => {
  const dbType = process.env.DB_TYPE || 'sqlite';

  if (dbType === 'mysql') {
    return {
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_DATABASE || 'vehicle_doc_ocr',
      entities: [ProcessedDocument, ExtractedData],
      synchronize: process.env.DB_SYNCHRONIZE !== 'false',
      logging: process.env.NODE_ENV === 'development',
    };
  }

  // SQLite fallback using writable /tmp directory on Vercel
  const sqliteDatabase = process.env.VERCEL
    ? path.join(os.tmpdir(), 'vehicle_doc_ocr.sqlite')
    : (process.env.DB_SQLITE_PATH || 'vehicle_doc_ocr.sqlite');

  return {
    type: 'sqlite',
    database: sqliteDatabase,
    entities: [ProcessedDocument, ExtractedData],
    synchronize: true,
    logging: false,
  };
};
