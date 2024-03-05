import { DataSource, Repository } from 'typeorm';
import { Auth, AuthParams } from './entities/auth.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthRepository extends Repository<Auth> {
  private readonly logger = new Logger(AuthRepository.name);

  constructor(private dataSource: DataSource) {
    super(Auth, dataSource.createEntityManager());
  }

  async findByUniq(param: AuthParams): Promise<Auth> {
    try {
      const { authId, email } = param;

      // get auth by email or userId
      const auth = await this.createQueryBuilder('auth')
        .where('auth.id = :id', { id: authId })
        .orWhere('auth.email = :email', { email })
        .getOne();
      return auth || null;
    } catch (error) {
      throw new HttpException(
        `Error thrown in auth.repository.ts, findByUniq method: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserWithAuth(param: AuthParams): Promise<Auth> {
    try {
      const { authId, email } = param;
      const auth = await this.createQueryBuilder('auth')
        .where('auth.id = :id', { id: authId })
        .orWhere('auth.email = :email', { email })
        .leftJoinAndSelect('auth.user', 'user')
        .leftJoinAndSelect('user.addresses', 'address')
        .leftJoinAndSelect('user.favourites', 'favourites')
        .getOne();

      return auth || null;
    } catch (error) {
      this.logger.error(
        'Error thrown in auth.repository.ts, getUserWithAuth method, with error: ' +
          error,
      );
      throw new HttpException(
        'Error ocurred with retrieving user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserByAuthId(authId: number): Promise<Auth> {
    try {
      const auth = await this.createQueryBuilder('auth')
        .where('auth.id = :id', { id: authId })
        .leftJoinAndSelect('auth.user', 'user')
        .getOne();

      return auth || null;
    } catch (error) {
      this.logger.error(
        'Error thrown in auth.repository.ts, getUserByAuthId method, with error: ' +
          error,
      );
      throw new HttpException(
        'Error ocurred with retrieving user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * This method updates the email of an auth account
   * @param authId
   * @param authDto
   * @returns
   */
  async updateEmail(authId: number, email: string): Promise<Auth> {
    const auth = await this.findOneBy({ id: authId });
    if (!auth) {
      this.logger.error('Auth not found when updating Email Address');
      throw new NotFoundException('Auth not found');
    }
    auth.email = email;
    await this.save(auth);
    return auth;
  }

  async unverifyAccount(authId: number): Promise<Auth> {
    try {
      const auth = await this.findOneBy({ id: authId });
      if (!auth) throw new Error('Auth not found');
      auth.accountVerified = false;
      await this.save(auth);
      return auth;
    } catch (e) {
      this.logger.error(
        'Error thrown in auth.repository.ts, unverifyAccount method, with error: ' +
          e,
      );
      throw new Error(`Unable to unverify account`);
    }
  }

  async updateOtp(authId: number, code: string, expiry: number): Promise<void> {
    await this.createQueryBuilder('auth')
      .update(Auth)
      .set({ otpCode: code, otpExpiry: expiry })
      .where('id = :id', { id: authId })
      .execute();
  }
}
