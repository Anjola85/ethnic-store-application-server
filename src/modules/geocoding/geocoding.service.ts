import { Injectable, Logger } from '@nestjs/common';
import { AddressDto } from '../address/dto/address.dto';
import axios from 'axios';

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  async setCoordinates(addressDto: AddressDto): Promise<AddressDto> {
    const addressString = `${addressDto.street}, ${addressDto.city}, ${addressDto.province}, ${addressDto.postalCode}, ${addressDto.country}`;
    const apiKey = process.env.GCP_GEOCODING_API_KEY;

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          addressString,
        )}&key=${apiKey}`,
      );

      const { results } = response.data;

      if (results.length > 0) {
        // Extract latitude and longitude from the geocoding response
        const { lat, lng } = results[0].geometry.location;

        // Populate the location property in the addressDto
        addressDto.location = `${lat}, ${lng}`;
      }

      return addressDto;
    } catch (error) {
      this.logger.error('Geocoding error: ', error);
      throw 'An error has occurred';
    }
  }
}
