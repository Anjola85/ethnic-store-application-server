/**
 * @see
 * This defines the request body for the signup endpoint
 */
import { AddressReqDto, MobileReqDto } from '../dto';

export interface SignupReqDto {
  firstName: string;
  lastName: string;
  address: AddressReqDto;
  userProfile: string;
  mobile: MobileReqDto;
  ethnicity: string;
  reason: string;
}
