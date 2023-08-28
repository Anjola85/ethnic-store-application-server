import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { encryptKms } from 'src/common/util/crypto';

@Injectable()
export class EncryptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // encrypt the data

    // Get the response data from the route handler
    return next.handle().pipe(
      map((data) => {
        console.log('Response: ', data.body);
        // Encrypt the response data here
        // const encryptedData = encryptKms(data);
        // return encryptedData;
        return '';
      }),
    );
  }
}
