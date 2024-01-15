import { DataSource, Repository } from 'typeorm';
import { Auth, AuthParams } from './entities/auth.entity';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { mobileToEntity } from 'src/common/mapper/mobile-mapper';
import { CreateAuthDto } from './dto/create-auth.dto';
import { MobileRepository } from '../mobile/mobile.repository';

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
      const { authId, email, userId } = param;
      const auth = await this.createQueryBuilder('auth')
        .where('auth.id = :id', { id: authId })
        .orWhere('auth.email = :email', { email })
        .orWhere('auth.userId = :userId', { userId })
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

  async updateAuth(authId: string, authDto: CreateAuthDto): Promise<any> {
    try {
      const mobile = mobileToEntity(authDto.mobile);

      const auth = await this.createQueryBuilder('auth')
        .update(Auth)
        .set({ email: authDto.email })
        .where('id = :id', { id: authId })
        .execute();

      return auth;
    } catch (e) {
      this.logger.error(
        'Error thrown in auth.repository.ts, updateAuth method, with error: ' +
          e,
      );
      throw new Error(`Unable to update account`);
    }
  }
}
