/**
 * This middleware decrypts the payload sent by the client.
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { decryptKms } from 'src/common/util/crypto';

@Injectable()
export class DecryptionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.body) {
      try {
        req.body = decryptKms(req.body.payload);
      } catch (error) {
        // Handle decryption error, perhaps by sending a response or logging
        return res.status(400).json({ error: 'Decryption failed' });
      }
    }
    next();
  }
}
