/**
 * This middleware decrypts the payload request made by the client.
 */

import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { decryptKms } from 'src/common/util/crypto';

@Injectable()
export class DecryptionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(DecryptionMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    if (req.body) {
      try {
        req.body = decryptKms(req.body.payload);

        this.logger.debug(
          'sendOtp decrypted payload: ' + JSON.stringify(req.body),
        );
      } catch (error) {
        return res.status(400).json({ error: 'Decryption failed' });
      }
    }
    next();
  }
}
