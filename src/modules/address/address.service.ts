import { Injectable, Logger } from '@nestjs/common';
import { AddressDto } from './dto/address.dto';
import { entityToAddressDto } from './address-mapper';
import { AddressRepository } from './address.respository';
import { Address } from './entities/address.entity';
import { GeocodingService } from '../geocoding/geocoding.service';
import {
  AddressListRespDto,
  AddressRespDto,
} from '../../contract/version1/response/address-response.dto';
import { AddressProcessor } from './address.processor';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UserRepository } from '../user/user.repository';
import { User } from '../user/entities/user.entity';

export interface AddressParams {
  id?: number;
  userId?: number;
  businessId?: string;
}

@Injectable()
export class AddressService {
  deleteAddressByUserId(userId: number) {
    throw new Error('Method not implemented.');
  }
  private readonly logger = new Logger(AddressService.name);
  constructor(
    private readonly addressRepository: AddressRepository,
    private readonly geoCodingService: GeocodingService,
  ) {}

  /**
   * Adds a new address to the DB
   * @param addressDto
   * @returns the newly added address
   */
  async addAddress(addressDto: AddressDto): Promise<Address> {
    try {
      await this.geoCodingService.setCoordinates(addressDto);
      const addressEntity: Address = Object.assign(new Address(), addressDto);
      const newAddress: Address = await this.addressRepository.addAddress(
        addressEntity,
        addressDto,
      );
      return newAddress;
    } catch (error) {
      this.logger.debug('Error in addAddress method: ' + error);
      throw error;
    }
  }

  /**
   *
   * @param params
   * @returns
   */
  async getAllAddress(params: AddressParams): Promise<AddressDto[]> {
    const addressEntity: Address[] = await this.addressRepository.getAddress(
      params,
    );
    const addressDto: AddressDto[] = addressEntity.map((address) =>
      entityToAddressDto(address),
    );
    return addressDto;
  }

  /**
   * This endpoint should only be called by the server and no client
   * @param addressId
   * @param addressDto
   * @returns updated AddressDto
   */
  async updateAddress(
    addressDto: AddressDto | UpdateAddressDto,
  ): Promise<Address> {
    if (!addressDto || !addressDto.id)
      throw new Error('Address id is required');

    // const addressEntity: Address = addressDtoToEntity(addressDto);
    const addressEntity: Address = new Address();
    Object.assign(addressEntity, addressDto);

    return await this.addressRepository.updateAddressById(
      addressDto.id,
      addressEntity,
    );
  }

  /**
   * Gets the address for the specific user
   * @param userId
   */
  async getAddress(userId: number): Promise<AddressListRespDto> {
    try {
      const addressList: Address[] = await this.addressRepository.getAddress({
        userId,
      });
      return AddressProcessor.mapEntityListToResp(addressList);
    } catch (error) {
      throw error;
    }
  }

  async deleteAddress(addressId: number): Promise<void> {
    try {
      await this.addressRepository.removeFromAddress(addressId);
    } catch (error) {
      this.logger.error(
        'Error thrown in deletedAddress method of address.service.ts',
      );
      throw error;
    }
  }

  async deleteUserAddress(addressId: number, userId: number): Promise<void> {
    try {
      await this.addressRepository.deleteUserAddress(addressId, userId);
    } catch (error) {
      this.logger.error(
        'Error thrown in deleteUserAddress method of address.service.ts',
      );
      throw error;
    }
  }

  async updateUnit(
    addressDtoRequest: UpdateAddressDto,
    user: User,
  ): Promise<AddressRespDto> {
    if (!addressDtoRequest || !addressDtoRequest.id)
      throw new Error('Address id is required');

    const addressEntity: Address = new Address();
    Object.assign(addressEntity, addressDtoRequest);
    addressEntity.user = user;

    const updatedAddress: Address =
      await this.addressRepository.updateAddressUnit(addressEntity);

    return AddressProcessor.mapEntityToResp(updatedAddress);
  }
}
