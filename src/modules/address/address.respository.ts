import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Address } from './entities/address.entity';

@Injectable()
export class AddressRepository extends Repository<Address> {
  private readonly logger = new Logger(AddressRepository.name);

  constructor(private dataSource: DataSource) {
    super(Address, dataSource.createEntityManager());
  }

  // add new address for User, can be multiple,
  async addUserAddress(address: Address) {
    try {
      const newAddress = await this.createQueryBuilder('address')
        .insert()
        .into(Address)
        .values(address)
        .execute();
      return newAddress;
    } catch (error) {
      this.logger.error(
        `Error thrown in address.repository.ts, addUserAddress method: ${error.message}`,
      );
      throw new HttpException(
        "Unable to add user's address to the database",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // add business address - can only be one
  async addBusinessAddress(address: Address) {
    try {
      const newAddress = await this.createQueryBuilder('address')
        .insert()
        .into(Address)
        .values(address)
        .execute();
      return newAddress;
    } catch (error) {
      this.logger.error(
        `Error thrown in address.repository.ts, addBusinessAddress method: ${error.message}`,
      );
      throw new HttpException(
        "Unable to add business's address to the database",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // update current address for Business
  async updateBusinessAddress(address: Address, businessId: string) {
    try {
      const updatedAddress = await this.createQueryBuilder('address')
        .update(Address)
        .set(address)
        .where('business.id = :businessId', { businessId })
        .execute();
      return updatedAddress;
    } catch (error) {
      this.logger.error(
        `Error thrown in address.repository.ts, updateBusinessAddress method: ${error.message}`,
      );
      throw new HttpException(
        "Unable to update business's address in the database",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // get all users address
  async getUserAddress(userId: string): Promise<Address[]> {
    try {
      if (!userId) throw new Error('userId is required');

      const addresses = await this.createQueryBuilder('address')
        .where('address.user.id = :userId', { userId })
        .getMany();
      return addresses;
    } catch (error) {
      this.logger.error(
        `Error thrown in address.repository.ts, getUserAddresses method: ${error.message}`,
      );
      throw new HttpException(
        "Unable to retrieve user's addresses from the database",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // delete user address
  async deleteUserAddress(addressId: string, userId: string) {
    try {
      const deletedAddress = await this.createQueryBuilder('address')
        .delete()
        .from(Address)
        .where('address.id = :addressId AND address.user.id = :userId', {
          addressId,
          userId,
        })
        .execute();
      return deletedAddress;
    } catch (error) {
      this.logger.error(
        `Error thrown in address.repository.ts, deleteUserAddress method: ${error.message}`,
      );
      throw new HttpException(
        "Unable to delete user's address from the database",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // update a single address
  async updateAddressById(
    addressId: string,
    address: Address,
  ): Promise<Address | undefined> {
    try {
      await this.createQueryBuilder('address')
        .update(Address)
        .set(address)
        .where('address.id = :addressId', { addressId })
        .execute();

      const updatedAddress = await this.findOneById(addressId);

      if (!updatedAddress) {
        throw new Error('Address not found');
      }

      return updatedAddress;
    } catch (error) {
      this.logger.error(
        `Error thrown in address.repository.ts, updateUserAddressById method: ${error.message}`,
      );
      throw new HttpException(
        "Unable to update user's address in the database",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // findone address by id
  async findOneById(addressId: string) {
    try {
      const address = await this.createQueryBuilder('address')
        .where('address.id = :addressId', { addressId })
        .getOne();

      if (!address) {
        throw new Error('Address not found');
      }

      return address;
    } catch (error) {
      this.logger.error(
        `Error thrown in address.repository.ts, findOne method: ${error.message}`,
      );
      throw new HttpException(
        'Unable to retrieve address from the database',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
