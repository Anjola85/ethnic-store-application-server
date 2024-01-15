/**
 * This middleware validates the token attached to the header request
 *
 */

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
      const { authId, userId } = await this.validateToken(res, token);

      if (req.body.authId || req.body.authId === '')
        req.body.authId = authId || '';

      if (req.body.userId || req.body.userId === '')
        req.body.userId = userId || '';

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

  private async validateToken(
    res: Response,
    token: string,
  ): Promise<{ authId: string; userId: string }> {
    const privateKey = fs.readFileSync('./secrets/private_key.pem');

    const decoded: any = await jsonwebtoken.verify(
      token,
      privateKey.toString(),
    );

    const ids = {
      authId: decoded?.authId || null,
      userId: decoded?.userId || null,
    };

    return ids;
  }
}
