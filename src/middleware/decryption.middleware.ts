/**
 * This middleware decrypts the payload request made by the client.
 */

import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { decryptPayload } from 'src/common/util/crypto';

@Injectable()
export class DecryptionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(DecryptionMiddleware.name);

  async use(req: Request, res: Response, next: NextFunction) {
    if ((req.headers.cryptoReq || req.body.payload) && req.body) {
      this.logger.debug('Decryption middleware recieved: ' + req.body);
      try {
        req.body = await decryptPayload(req.body.payload);
        this.logger.debug('Decrypted payload: ' + JSON.stringify(req.body));
      } catch (error) {
        return res.status(400).json({ error: 'Decryption failed' });
      }
    }
    next();
  }
}
