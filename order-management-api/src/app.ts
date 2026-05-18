import 'reflect-metadata';
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { createRouter } from '@presentation/routes';
import { errorHandler } from '@presentation/middleware/error-handler.middleware';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json({ limit: '20mb' }));

  app.use('/api', createRouter());
  app.use(errorHandler);

  return app;
}
