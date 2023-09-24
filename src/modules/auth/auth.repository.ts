import { DataSource, Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MobileDto } from 'src/common/dto/mobile.dto';
import { mobileToEntity } from 'src/common/mapper/mobile-mapper';
import { Input } from 'aws-sdk/clients/kinesisanalytics';

export interface InputObject {
  id?: string;
  email?: string;
  mobile?: MobileDto;
}

@Injectable()
export class AuthRepository extends Repository<Auth> {
  constructor(private dataSource: DataSource) {
    super(Auth, dataSource.createEntityManager());
  }

  async findByUniq(input: InputObject): Promise<Auth> {
    try {
      // use switch cases
      const { id, email, mobile } = input;
      const entityMobile = mobileToEntity(mobile);
      const auth = await this.findBy({ id, email, mobile: entityMobile });

      return auth[0] || null;
    } catch (error) {
      throw new HttpException(
        `Error thrown in auth.repository.ts, findByUniq method: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserWithAuth(input: InputObject): Promise<Auth> {
    try {
      const { id, email, mobile } = input;
      const entityMobile = mobileToEntity(mobile);
      // find auth by the above object and join user table with user.addresses
      const auth = await this.createQueryBuilder('auth')
        .where('auth.id = :id', { id })
        .orWhere('auth.email = :email', { email })
        .orWhere('auth.mobile = :mobile', { mobile: entityMobile })
        .leftJoinAndSelect('auth.user', 'user')
        .leftJoinAndSelect('user.addresses', 'address')
        .leftJoinAndSelect('user.favourites', 'favourites')
        .getOne();

      return auth || null;
    } catch (error) {
      throw new HttpException(
        `Error thrown in auth.repository.ts, getUserWithAuth method: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
