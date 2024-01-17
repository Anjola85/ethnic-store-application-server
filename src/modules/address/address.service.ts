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
   * @returns the newly added address
   */
  async addAddress(addressDto: AddressDto): Promise<Address> {
    console.log('addressDto', addressDto);

    // set coordinates
    await this.geoCodingService.setCoordinates(addressDto);

    // map dto to entity
    const addressEntity = new Address();
    Object.assign(addressEntity, addressDto);

    // save to db
    const newAddress = await this.addressRepository
      .create(addressEntity)
      .save();

    return newAddress;
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
