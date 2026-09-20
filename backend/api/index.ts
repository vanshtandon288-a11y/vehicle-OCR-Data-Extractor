import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const expressApp = express();
expressApp.use(express.json({ limit: '50mb' }));
expressApp.use(express.urlencoded({ limit: '50mb', extended: true }));

export const createNestApp = async (expressInstance: any) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();
  return app;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

let cachedApp: any;

export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    cachedApp = await createNestApp(expressApp);
  }
  expressApp(req, res);
}
