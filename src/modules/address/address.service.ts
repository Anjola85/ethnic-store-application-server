import { Injectable, Logger } from '@nestjs/common';
import { AddressDto } from './dto/address.dto';
import { addressDtoToEntity, entityToAddressDto } from './address-mapper';
import { AddressRepository } from './address.respository';
import { Address } from './entities/address.entity';
import { GeocodingService } from '../geocoding/geocoding.service';

export interface AddressParams {
  id?: string;
  userId?: string;
  businessId?: string;
}

@Injectable()
export class AddressService {
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
  async addAddress(addressDto: AddressDto): Promise<any> {
    try {
      await this.geoCodingService.setCoordinates(addressDto);
      const addressEntity: Address = Object.assign(new Address(), addressDto);

      const newAddress = await this.addressRepository.addAddress(
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
  async getAddress(params: AddressParams): Promise<AddressDto[]> {
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
  async updateAddress(addressDto: AddressDto): Promise<Address> {
    if (!addressDto || !addressDto.id)
      throw new Error('Address id is required');

    const addressEntity: Address = addressDtoToEntity(addressDto);
    const updatedAddressEntity = await this.addressRepository.updateAddressById(
      addressDto.id,
      addressEntity,
    );

    return updatedAddressEntity;
  }
}
