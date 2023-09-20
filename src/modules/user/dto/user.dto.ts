// payloadToEncrypt:  {
//   payload: {
//     user: User {
//       id: 'eb2fe5b4-81d4-467f-a2a1-2816e9dcb5d9',
//       deleted: false,
//       created_at: 2023-09-19T00:40:36.721Z,
//       updated_at: 2023-09-19T00:40:36.721Z,
//       first_name: 'David',
//       last_name: 'Check',
//       user_profile: 'customer',
//       dob: null,
//       profile_image: 'https://home-closer-assets-db.s3.amazonaws.com/user_assets/avatar_images/avatar_4',
//       active: true
//     },
//     auth: { email: 'anjola85@gmail.com', mobile: null }
//   }
// }

import { AddressDto } from 'src/common/dto/address.dto';
import { MobileDto } from 'src/common/dto/mobile.dto';

/**
 * Communication contract with the client
 */
export class UserDto {
  firstName: string;
  lastName: string;
  addresses: AddressDto[];
  dob: string;
  profileImage: string;
  userProfile: string;
  email: string;
  mobile: MobileDto;
}
