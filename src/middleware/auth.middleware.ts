/**
 * @see
 * @brief - This middleware handles authentication and token validation, it extracts ids from the token attached to the header request
 * @authId - the id of the user's session
 * @userId - the id of the user
 * @cryptoResp - specifies if the response should be encrypted or not
 * @cryptoReq - specifies if the request is encrypted or now
 * @validateToken - validates and extract ids from token, if validated, user has an active session
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
import { EnvConfigService } from 'src/config/env-config';

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

      // attach authId and userId to the request object
      res.locals.authId = authId;
      res.locals.userId = userId;

      // if cryptoResp is not provided in the header, default to true
      res.locals.cryptoresp = req.headers.cryptoresp || 'true';

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

  /**
   * Validate and extract ids from token, if validated, user has an active session
   * @param res
   * @param token
   * @returns authId and userId
   */
  private async validateToken(
    res: Response,
    token: string,
  ): Promise<{ authId: number; userId: number }> {
    // const privateKey = fs.readFileSync('./secrets/private_key.pem');
    const privateKey = EnvConfigService.get('JWT_SECRET_KEY');
    const decoded: any = await jsonwebtoken.verify(
      token,
      privateKey.toString(),
    );

    const authId = decoded?.authId || null;
    const userId = decoded?.userId || null;

    if (!authId && !userId) {
      this.logger.debug(
        "Unable to retrieve Id's from token provided in auth.middleware.ts:",
      );
      throw new HttpException(
        'Error occured while validating token, please try again later.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const ids = {
      authId: Number(authId),
      userId: Number(userId),
    };

    return ids;
  }
}
