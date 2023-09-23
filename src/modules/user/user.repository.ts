import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async getUserById(id: string): Promise<User> {
    try {
      const user = await this.createQueryBuilder('user')
        .leftJoinAndSelect('user.addresses', 'address')
        .where('user.id = :id', { id })
        .getMany();
      return user[0] || null;
    } catch (error) {
      throw new HttpException(
        `Error thrown in user.repository.ts, getUserById method: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // update user method
}
