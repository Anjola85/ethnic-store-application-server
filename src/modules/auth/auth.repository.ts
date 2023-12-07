import { DataSource, Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { MobileDto } from 'src/common/dto/mobile.dto';
import { mobileToEntity } from 'src/common/mapper/mobile-mapper';
import { Input } from 'aws-sdk/clients/kinesisanalytics';
import { CreateAuthDto } from './dto/create-auth.dto';

export interface InputObject {
  id?: string;
  email?: string;
  mobile?: MobileDto;
  userId?: string;
}

@Injectable()
export class AuthRepository extends Repository<Auth> {
  private readonly logger = new Logger(AuthRepository.name);

  constructor(private dataSource: DataSource) {
    super(Auth, dataSource.createEntityManager());
  }

  async findByUniq(input: InputObject): Promise<Auth> {
    try {
      const { id, email, mobile, userId } = input;
      const entityMobile = mobileToEntity(mobile);
      const auth = await this.createQueryBuilder('auth')
        .where('auth.id = :id', { id })
        .orWhere('auth.email = :email', { email })
        .orWhere('auth.mobile = :mobile', { mobile: entityMobile })
        .orWhere('auth.userId = :userId', { userId })
        .leftJoinAndSelect('auth.user', 'user')
        .getOne();

      return auth || null;
    } catch (error) {
      throw new HttpException(
        `Error thrown in auth.repository.ts, findByUniq method: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserWithAuth(input: InputObject): Promise<Auth> {
    try {
      const { id, email, mobile, userId } = input;
      const entityMobile = mobileToEntity(mobile);
      const auth = await this.createQueryBuilder('auth')
        .where('auth.id = :id', { id })
        .orWhere('auth.email = :email', { email })
        .orWhere('auth.mobile = :mobile', { mobile: entityMobile })
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
        .set({ email: authDto.email, mobile })
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
