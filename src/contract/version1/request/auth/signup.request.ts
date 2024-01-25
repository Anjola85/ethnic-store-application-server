/**
 * @see
 * This defines the request body for the signup endpoint
 */
import { AddressDto, MobileDto } from '../dto';

export interface SignupRequest {
  firstName: string;
  lastName: string;
  address: AddressDto;
  userProfile: string;
  mobile: MobileDto;
  ethnicity: string;
  reason: string;
}
