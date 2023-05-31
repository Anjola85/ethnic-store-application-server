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
      await this.validate(res, token);

      next();
    } catch (error) {
      throw new HttpException('Invalid token: ', HttpStatus.UNAUTHORIZED);
    }
  }

  private async validate(res: Response, token: string): Promise<void> {
    const privateKey = fs.readFileSync('./private_key.pem');

    const decoded: any = await jsonwebtoken.verify(
      token,
      privateKey.toString(),
    );

    // add user id to response object
    res.locals.email = decoded._id;
  }
}
