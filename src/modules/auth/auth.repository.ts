import { DataSource, Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MobileDto } from 'src/common/dto/mobile.dto';
import { mobileMapper } from 'src/common/mapper/mobile-mapper';

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
      const enityMobile = mobileMapper(mobile);
      const auth = await this.findBy({ id, email, mobile: enityMobile });

      return auth[0] || null;
    } catch (error) {
      throw new HttpException(
        `Error thrown in auth.repository.ts, failed to find auth`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
