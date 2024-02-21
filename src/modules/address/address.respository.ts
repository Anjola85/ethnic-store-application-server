import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { AddressParams } from './address.service';
import { getCurrentEpochTime } from 'src/common/util/functions';
import { AddressDto } from './dto/address.dto';

@Injectable()
export class AddressRepository extends Repository<Address> {
  private readonly logger = new Logger(AddressRepository.name);

  constructor(private dataSource: DataSource) {
    super(Address, dataSource.createEntityManager());
  }

  /**
   * REPLACE THIS FUNCTION WITH CREATE(provided by typeORM)
   * This inserts a new address into the database
   * @param address
   * @returns
   */
  async addAddress(
    addressEntity: Address,
    addressDto: AddressDto,
  ): Promise<Address> {
    try {
      const currentEpochTime = getCurrentEpochTime();

      const newAddress = await this.createQueryBuilder('address')
        .insert()
        .into(Address)
        .values({
          createdAt: currentEpochTime, // manually set the created at time
          updatedAt: currentEpochTime, // manually set the updated at time
          street: addressEntity.street,
          city: addressEntity.city,
          province: addressEntity.province,
          postalCode: addressEntity.postalCode,
          country: addressEntity.country,
          user: addressEntity.user,
          business: addressEntity.business,
          isPrimary: addressEntity.isPrimary,
          unit: addressEntity.unit,
          location: () =>
            `ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify({
              type: 'Point',
              coordinates: [
                addressDto.location.coordinates[0],
                addressDto.location.coordinates[1],
              ],
            })}'), 4326)`,
        })
        .returning('*')
        .execute();

      const insertedAddressId = newAddress.generatedMaps[0].id;
      const address = await this.getAddressWithLongLat(insertedAddressId);
      return address;
    } catch (error) {
      this.logger.error(
        `Error thrown in address.repository.ts, addAddress method: ${error}`,
      );
      throw new HttpException(
        'Unable to add address to the database',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAddressWithLongLat(id: number): Promise<Address> {
    try {
      const query = this.createQueryBuilder('address')
        .select('address', 'address')
        .addSelect('ST_X(address.location::geometry)', 'longitude')
        .addSelect('ST_Y(address.location::geometry)', 'latitude')
        .where('address.id = :id', { id })
        .getOne();

      return query;
    } catch (error) {
      this.logger.error(
        `Error thrown in address.repository.ts, getAddressWithLongLat method: ${error}`,
      );

      throw new HttpException(
        'Unable to retrieve address with long lat from the database',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAddress(params: AddressParams): Promise<Address[]> {
    try {
      const addresses = await this.createQueryBuilder('address')
        .where('address.id = :id', { id: params.id })
        .orWhere('address.user.id = :id', { id: params.userId })
        .orWhere('address.business.id = :id', { id: params.businessId })
        .getMany();

      return addresses;
    } catch (error) {
      this.logger.error(
        `Error thrown in address.repository.ts, getAddress method: ${error.message}`,
      );
      throw new HttpException(
        'Unable to retrieve address from the database',
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

  /**
   * Updates a single address
   * @param addressId
   * @param address
   * @returns
   */
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

  /**
   * Gets an address by Id
   * @param addressId
   * @returns
   */
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
