import { EnvConfigService } from 'src/modules/config/env-config.';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AddressDto } from '../address/dto/address.dto';
import axios from 'axios';

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly configService: EnvConfigService;

  // async setCoordinates(addressDto: AddressDto): Promise<AddressDto> {
  //   this.logger.debug('Setting coordinates');
  //   const addressString = `${addressDto.street}, ${addressDto.city}, ${addressDto.province}, ${addressDto.postalCode}, ${addressDto.country}`;
  //   const apiKey = EnvConfigService.get('GCP_GEOCODING_API_KEY');

  //   try {
  //     const response = await axios.get(
  //       `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
  //         addressString,
  //       )}&key=${apiKey}`,
  //     );

  //     // this.logger.debug('Geocoding response: ', response.data);

  //     const { results } = response.data;

  //     if (results.length > 0) {
  //       // Extract latitude and longitude from the geocoding response
  //       const { lat, lng } = results[0].geometry.location;

  //       // Populate the location property in the addressDto
  //       addressDto.location = `${lat}, ${lng}`;
  //     }

  //     return addressDto;
  //   } catch (error) {
  //     this.logger.error('Geocoding error: ', error);
  //     throw 'An error has occurred';
  //   }
  // }
  async setCoordinates(addressDto: AddressDto): Promise<AddressDto> {
    this.logger.debug('Setting coordinates');
    const addressString = `${addressDto.street}, ${addressDto.city}, ${addressDto.province}, ${addressDto.postalCode}, ${addressDto.country}`;
    const apiKey = EnvConfigService.get('GCP_GEOCODING_API_KEY'); // Adjust based on how you access env vars

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          addressString,
        )}&key=${apiKey}`,
      );

      const { results } = response.data;

      if (results.length > 0) {
        const { lat, lng } = results[0].geometry.location;

        // Create a GeoJSON object for the location
        addressDto.location = {
          type: 'Point',
          coordinates: [lng, lat], // Note: GeoJSON uses [longitude, latitude] order
        };
      }

      return addressDto;
    } catch (error) {
      this.logger.error('Geocoding error: ', error);
      throw new HttpException(
        'An error has occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
