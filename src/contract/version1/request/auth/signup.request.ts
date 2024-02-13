/**
 * @see
 * This defines the request body for the signup endpoint
 */
import { AddressDto, MobileRespDto } from '../dto';

export interface SignupRequest {
  firstName: string;
  lastName: string;
  address: AddressDto;
  userProfile: string;
  mobile: MobileRespDto;
  ethnicity: string;
  reason: string;
}
