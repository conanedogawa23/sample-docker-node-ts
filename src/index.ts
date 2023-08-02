import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import compression from 'compression';
import morgan from 'morgan';
import { createStream } from 'rotating-file-stream'; // For log rotation
import path from 'path';
import ImageRoutes from './routes/image.routes';
import Database from './config/db';
import { logger } from './config/logger';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
    this.errorHandling();
  }

  private config(): void {
    // Helmet for added security headers
    this.app.use(helmet());

    // Enable CORS
    this.app.use(cors());

    // Body parser middleware
    this.app.use(bodyParser.json());

    // Compression middleware for Gzip compression
    this.app.use(compression());

    // Logging with Morgan (combined format)
    this.app.use(morgan('combined'));

    // Log rotation for log files
    const logDirectory = path.join(__dirname, 'logs');
    const logStream = createStream('access.log', {
      interval: '1d', // Rotate daily
      path: logDirectory,
    });
    this.app.use(morgan('combined', { stream: logStream }));

    // Serve static files (optional)
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  private routes(): void {
    this.app.use('/api', ImageRoutes);
  }

  private notFoundHandler(req: Request, res: Response, next: NextFunction): void {
    res.status(404).json({ error: 'Not found' });
  }

  private errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
    logger.error('Error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }

  private errorHandling(): void {
    this.app.use(this.notFoundHandler);
    this.app.use(this.errorHandler);
  }
}

export default new App().app;
