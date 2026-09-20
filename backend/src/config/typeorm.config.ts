import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ProcessedDocument } from '../database/entities/document.entity';
import { ExtractedData } from '../database/entities/extracted-data.entity';

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

  // SQLite fallback for easy running without external server setup
  return {
    type: 'sqlite',
    database: process.env.DB_SQLITE_PATH || 'vehicle_doc_ocr.sqlite',
    entities: [ProcessedDocument, ExtractedData],
    synchronize: true,
    logging: false,
  };
};
