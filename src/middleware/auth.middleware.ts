import {
  Injectable,
  NestMiddleware,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private auth0Client: any;

  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new HttpException('Missing token', HttpStatus.UNAUTHORIZED);
    }

    try {
      // verify the token
      const decodedToken = await this.jwtService.verifyAsync(token);

      // check if jwt is not valid or expired
      if (!decodedToken.userId) {
        throw new Error();
      }

      // decoded token is userId so get back the user information with this from mongodb
      const userInfo = await UserService.prototype.findOne(decodedToken.userId);

      // check if user exists
      if (!userInfo) {
        throw new Error();
      }

      // add user id to request header
      req.headers.userId = decodedToken.userId;

      next();
    } catch (error) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }
}
