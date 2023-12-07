import {
  Injectable,
  NestMiddleware,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import * as jsonwebtoken from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;

    if (!token) {
      throw new HttpException(
        'Token is required in the header',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      await this.validate(res, token);

      next();
    } catch (error) {
      this.logger.debug(
        'error in auth.middleware.ts: ' +
          error.message +
          ' with error: ' +
          error,
      );
      throw new HttpException(
        'Invalid token provided',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  private async validate(res: Response, token: string): Promise<void> {
    const privateKey = fs.readFileSync('./private_key.pem');

    const decoded: any = await jsonwebtoken.verify(
      token,
      privateKey.toString(),
    );

    // add user id to response object
    res.locals.id = decoded?.id || null;
  }
}