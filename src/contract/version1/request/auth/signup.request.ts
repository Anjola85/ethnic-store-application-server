/**
 * @see
 * This defines the request body for the signup endpoint
 */
import { AddressDto, MobileReqDto } from '../dto';

export interface SignupRequest {
  firstName: string;
  lastName: string;
  address: AddressDto;
  userProfile: string;
  mobile: MobileReqDto;
  ethnicity: string;
  reason: string;
}
