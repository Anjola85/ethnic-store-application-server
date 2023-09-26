import { Injectable } from '@nestjs/common';
import { AddressDto } from './dto/address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { addressDtoToEntity, entityToAddressDto } from './address-mapper';
import { AddressRepository } from './address.respository';
import { Address } from './entities/address.entity';
import { GeocodingService } from '../geocoding/geocoding.service';

@Injectable()
export class AddressService {
  constructor(
    private readonly addressRepository: AddressRepository,
    private readonly geoCodingService: GeocodingService,
  ) {}

  /**
   *
   * @param addressDto
   * @returns AddressDto[newly added address]
   */
  async addUserAddress(addressDto: AddressDto): Promise<string> {
    await this.geoCodingService.setCoordinates(addressDto);
    const addressEntity: Address = addressDtoToEntity(addressDto);
    const response = await this.addressRepository.addUserAddress(addressEntity);
    return response.identifiers[0].id;
  }

  async getUserAddress(id: string): Promise<AddressDto[]> {
    const addressEntity: Address[] =
      await this.addressRepository.getUserAddress(id);
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
