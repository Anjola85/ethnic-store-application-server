/**
 * @description - Encrypts the payload body being sent to the client.
 * @see CryptoInterceptor This class intercepts the API response and encrypts the response payload body being sent to the client.
 *
 */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, mergeMap } from 'rxjs';
import { EncryptedDTO } from 'src/common/dto/encrypted.dto';
import { encryptPayload } from 'src/common/util/crypto';
import { createEncryptedResponse } from 'src/common/util/response';

@Injectable()
export class CryptoInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CryptoInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      mergeMap(async (data) => {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const requestUrl = request.url;

        // ignore routes that don't need encryption
        if (
          requestUrl.includes('auth/decrypt') ||
          requestUrl.includes('auth/encrypt')
        ) {
          return data;
        }

        if (
          request.headers['cryptoresp'] === 'true' ||
          request.headers['cryptoresp'] === undefined
        ) {
          this.logger.debug('Encrypting response payload');
          const encryptedResp = await encryptPayload(data);
          return createEncryptedResponse(encryptedResp);
        }
        this.logger.debug('Clear response payload');
        return data;
      }),
    );
  }
}
