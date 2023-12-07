import { Injectable } from '@nestjs/common';
import { AddressDto } from './dto/address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
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
  constructor(
    private readonly addressRepository: AddressRepository,
    private readonly geoCodingService: GeocodingService,
  ) {}

  /**
   * Adds a new address to the DB
   * @param addressDto
   * @returns the id of the newly created address
   */
  async addAddress(addressDto: AddressDto): Promise<string> {
    if (addressDto.user) {
      addressDto.primary = true;
    }

    await this.geoCodingService.setCoordinates(addressDto);
    const addressEntity: Address = addressDtoToEntity(addressDto);
    const response = await this.addressRepository.addAddress(addressEntity);
    return response.identifiers[0].id;
  }

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
  async updateAddress(addressDto: AddressDto): Promise<AddressDto> {
    if (!addressDto || !addressDto.id)
      throw new Error('Address id is required');

    const addressEntity: Address = addressDtoToEntity(addressDto);
    const updatedAddressEntity = await this.addressRepository.updateAddressById(
      addressDto.id,
      addressEntity,
    );
    const address: AddressDto = entityToAddressDto(updatedAddressEntity);
    return address;
  }
}
