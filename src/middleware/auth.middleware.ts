import {
  Injectable,
  NestMiddleware,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
import * as jsonwebtoken from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { UserService } from 'src/modules/user/user.service';
import * as fs from 'fs';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;

    if (!token) {
      throw new HttpException(
        'Token is required in the header',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      // verify the token
      // const decodedToken = await this.jwtService.verifyAsync(token);

      const privateKey = fs.readFileSync('./private_key.pem');

      // TODO: unable to verify the tokenm getting back errors
      jsonwebtoken.verify(token, privateKey.toString());

      next();
    } catch (error) {
      throw new HttpException('Invalid token: ', HttpStatus.UNAUTHORIZED);
    }
  }
}
