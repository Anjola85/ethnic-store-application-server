import { Injectable } from '@nestjs/common';
import { AddressDto } from './dto/address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { addressDtoToEntity, entityToAddressDto } from './address-mapper';
import { AddressRepository } from './address.respository';
import { Address } from './entities/address.entity';

@Injectable()
export class AddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

  /**
   *
   * @param addressDto
   * @returns AddressDto[]
   */
  async addUserAddress(addressDto: AddressDto): Promise<AddressDto[]> {
    const addressEntity: Address = addressDtoToEntity(addressDto);
    await this.addressRepository.addUserAddress(addressEntity);
    const allAddresses = await this.addressRepository.getUserAddress(
      addressDto.user.id,
    );
    const userAddress: AddressDto[] = allAddresses.map((address) =>
      entityToAddressDto(address),
    );
    return userAddress;
  }

  /**
   * This endpoint should only be called by the server and no client
   * @param addressId
   * @param addressDto
   * @returns updated AddressDto
   */
  async updateAddress(
    addressId: string,
    addressDto: AddressDto,
  ): Promise<AddressDto> {
    const addressEntity: Address = addressDtoToEntity(addressDto);
    const updatedAddressEntity = await this.addressRepository.updateAddressById(
      addressId,
      addressEntity,
    );
    const address: AddressDto = entityToAddressDto(updatedAddressEntity);
    return address;
  }
}
