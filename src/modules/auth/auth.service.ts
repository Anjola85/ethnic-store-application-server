import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { loginDto } from './dto/login.dto';
import { UserAccountService } from '../user_account/user_account.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as jsonwebtoken from 'jsonwebtoken';
import { NotFoundError } from 'rxjs';
import { Auth, AuthDocument } from './entities/auth.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name)
    protected authModel: Model<AuthDocument> & any,
    private readonly userService: UserService,
    private readonly userAccountService: UserAccountService,
  ) {}

  async create(createAuthDto: CreateAuthDto, userID: string): Promise<any> {
    try {
      const saltOrRounds = 10;
      const salt = await bcrypt.genSalt(saltOrRounds);
      const password: string = createAuthDto.password;

      // hash the password
      const hashedPassword: string = await bcrypt.hash(password, salt); //TODO: errro here: data and salt argument required

      // add auth to database
      let auth = new this.authModel({
        password: hashedPassword,
        user_account_id: userID,
      });

      auth = await auth.save();

      return auth;
    } catch (e) {
      throw new Error(`From AuthService.create method: ${e.message}`);
    }
  }

  async login(loginDto: loginDto): Promise<any> {
    try {
      let user: any;

      // retrieve user_account_id from user database
      if (loginDto.email !== '') {
        user = await this.userAccountService.getUserByEmail(loginDto.email);
      } else if (loginDto.phone !== '') {
        user = await this.userAccountService.getUserByPhone(loginDto.phone);
      }
      const userId: string = user[0].id;

      // get password from auth database
      const auth = await this.authModel.find({ user_account_id: userId });

      if (user != null && Object.keys(auth).length > 0) {
        const encryptedPassword: string = auth[0].password;

        // check if password matches, the encrypted password is store in auth
        const passwordMatch: boolean = await bcrypt.compare(
          loginDto.password,
          encryptedPassword,
        );

        if (passwordMatch) {
          // generate token
          const privateKey = fs.readFileSync('./private_key.pem');
          const token = jsonwebtoken.sign(
            { id: user.id },
            privateKey.toString(),
            {
              expiresIn: '1d',
            },
          );

          // return user
          return {
            message: 'user successfully logged in',
            token,
            user,
          };
        } else {
          throw new UnauthorizedException(
            'Invalid credentials, passwords dont match',
          );
        }
      } else {
        throw new Error('User not found');
      }
    } catch (e) {
      throw new Error(`From AuthService.login: ${e.message}`);
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
