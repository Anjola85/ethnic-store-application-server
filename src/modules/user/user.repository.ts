import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { getCurrentEpochTime } from 'src/common/util/functions';
import { Auth } from '../auth/entities/auth.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async getUserByAuthId(authId: string): Promise<User> {
    try {
      const user = await this.createQueryBuilder('user')
        .leftJoinAndSelect('user.addresses', 'address')
        .where('user.authId = :authId', { authId })
        .getOne();
      return user || null;
    } catch (error) {
      throw new HttpException(
        `Error thrown in user.repository.ts, getUserByAuthId method: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserById(id: number): Promise<User> {
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

  async addUser(user: User) {
    try {
      const newUser = await this.createQueryBuilder('user')
        .insert()
        .into(User)
        .values(user)
        .execute();
      return newUser;
    } catch (error) {
      throw new HttpException(
        `Error thrown in user.repository.ts, createUser method: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * TODO: ERROR HERE - BUT GETTING EXPECTED CASE
   * Updates the user entity with provided fields
   * @param user
   * @returns
   */
  async updateUser(user: User) {
    try {
      const updatedUser = await this.createQueryBuilder('user')
        .update(User)
        .set(user)
        .where('id = :id', { id: user.id })
        .execute();
      return updatedUser;
    } catch (error) {
      throw new HttpException(
        `Error thrown in user.repository.ts, updateUser method: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUserImageUrl(id: number, imageUrl: string) {
    try {
      const updatedUser = await this.createQueryBuilder('user')
        .update(User)
        .set({ profileImage: imageUrl })
        .set({ updatedAt: getCurrentEpochTime() })
        .where('id = :id', { id })
        .execute();
      return updatedUser;
    } catch (error) {
      throw new HttpException(
        `Error thrown in user.repository.ts, updateUserImageUrl method: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * This method returns a user object by its id with all relations
   * realtions - addresses, FAVOURITES, business, country, auth
   * @param userId
   * @returns - user
   */
  async getUserWithRelations(userId: number): Promise<User> {
    return this.findOne({
      where: { id: userId },
      relations: [
        'addresses',
        'favourites',
        'countryOfOrigin',
        'business',
        'countryOfOrigin',
        'auth',
      ],
    });
  }

  /**
   * This method returns a user object by its id with some relations
   * relations - addresses, business, country, auth
   * @param userId
   * @returns - user
   */
  async getUserInfoById(userId: number): Promise<User> {
    return this.findOne({
      where: { id: userId },
      relations: ['addresses', 'business', 'countryOfOrigin', 'auth'],
    });
  }

  async updateAuth(auth: Auth, userId: number): Promise<User> {
    const updateResult = await this.createQueryBuilder('user')
      .update(User)
      .set({ auth })
      .where('id = :id', { id: userId })
      .returning('*')
      .execute();

    const updatedUser = updateResult.raw[0] as User; // Accessing the updated record from the raw property
    return updatedUser;
  }
}
