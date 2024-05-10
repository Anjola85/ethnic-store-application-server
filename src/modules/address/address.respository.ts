import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { AddressParams } from './address.service';
import { getCurrentEpochTime } from 'src/common/util/functions';
import { AddressDto } from './dto/address.dto';
import { User } from '../user/entities/user.entity';

//TODO: sort the address basedon updatedAt
@Injectable()
export class AddressRepository extends Repository<Address> {
  private readonly logger = new Logger(AddressRepository.name);

  constructor(private dataSource: DataSource) {
    super(Address, dataSource.createEntityManager());
  }

  /**
   * This inserts a new address into the database
   * @returns
   * @param addressEntity
   * @param addressDto
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
          isPrimary: addressEntity.isPrimary || true,
          unit: addressEntity.unit,
          location: () =>
            `ST_SetSRID(ST_GeomFromGeoJSON('${JSON.stringify({
              type: 'Point',
              coordinates: [
                addressDto.location.coordinates[0], // represents longitude
                addressDto.location.coordinates[1], // represents latitude
              ],
            })}'), 4326)`,
        })
        .returning('*')
        .execute();

      const insertedAddressId = newAddress.generatedMaps[0].id;
      return await this.getAddressWithLongLat(insertedAddressId);
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

  /**
   *
   * @param params
   * @returns Address[]
   */
  async getAddress(params: AddressParams): Promise<Address[]> {
    try {
      let addressList: Address[];
      if (params.id)
        addressList = await this.createQueryBuilder('address')
          .where('address.id = :id', { id: params.id })
          .andWhere('address.deleted = false')
          .orderBy('address.updatedAt', 'DESC')
          .getMany();
      else if (params.businessId)
        addressList = await this.createQueryBuilder('address')
          .where('address.business.id = :businessId', { id: params.businessId })
          .andWhere('address.deleted = false')
          .orderBy('address.updatedAt', 'DESC')
          .getMany();
      else if (params.userId)
        addressList = await this.createQueryBuilder('address')
          .where('address.user.id = :userId', { userId: params.userId })
          .andWhere('address.deleted = false')
          .orderBy('address.updatedAt', 'DESC')
          .getMany();

      // set primary to the first
      if(addressList[0])
        addressList[0].isPrimary = true;

      return addressList;
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
      return await this.createQueryBuilder('address')
        .update(Address)
        .set(address)
        .where('business.id = :businessId', { businessId })
        .execute();
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
      const currentAddress: Address = await this.createQueryBuilder('address')
        .where('address.id = :addressId', { addressId })
        .andWhere('address.deleted = false')
        .getOne();

      if (!currentAddress)
        throw new NotFoundException('Address to be updated not found');

      Object.assign(currentAddress, address);

      return await currentAddress.save();
    } catch (error) {
      this.logger.error(
        `Error thrown in address.repository.ts, updateUserAddressById method: ${error.message}`,
      );
      throw error;
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

  async removeFromAddress(addressId: number): Promise<void> {
    try {
      const address: Address = await this.createQueryBuilder('address')
        .where('address.id = :addressId', { addressId })
        .andWhere('address.deleted = false')
        .getOne();

      address.deleted = true;
      await this.save(address);
    } catch (error) {
      this.logger.error('Unable to add address to API');
    }
  }

  async updateAddressUnit(addressEntity: Address): Promise<Address> {
    const currentAddress: Address = await this.createQueryBuilder('address')
      .where('address.id = :addressId', { addressId: addressEntity.id })
      .andWhere('address.deleted = false')
      .getOne();

    if (!currentAddress)
      throw new NotFoundException('Address to be updated not found');

    currentAddress.unit = addressEntity.unit;
    currentAddress.user = addressEntity.user;

    return await currentAddress.save();
  }

  // TODO: implement transactions for dependent read/writes to DB
  // TODO: Improve logging
}
