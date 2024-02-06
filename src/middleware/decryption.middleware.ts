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
        console.log('Decrypting payload: ' + JSON.stringify(req.body));
        req.body = await decryptPayload(req.body.payload);
        this.logger.debug('Decrypted payload: ' + JSON.stringify(req.body));
      } catch (error) {
        return res.status(400).json({ error: 'Decryption failed' });
      }
    }
    next();
  }
}

// async use(req: Request, res: Response, next: NextFunction) {
//   console.log('Decryption middleware recieved: ' + JSON.stringify(req.body));
//   if ((req.body.cryptoReq || req.body.payload) && req.body) {
//     console.log('decrypting payload');
//     this.logger.debug('Decryption middleware recieved: ' + req.body.payload);
//     try {
//       console.log('Decrypting payload: ' + JSON.stringify(req.body));
//       req.body.payload = await decryptPayload(req.body.payload);
//       this.logger.debug('Decrypted payload: ' + JSON.stringify(req.body));
//     } catch (error) {
//       return res.status(400).json({ error: 'Decryption failed' });
//     }
//   } else if (
//     req.body.cryptoReq === undefined &&
//     req.body.payload === undefined
//   ) {
//     //TODO: only local
//     console.log('not handling this request');
//     this.logger.debug('No payload to decrypt');
//     throw new HttpException('Invalid Request', 400);
//   }
//   // TODO: only local
//   console.log("Decryption middleware's next() called");
//   next();
// }
// }
