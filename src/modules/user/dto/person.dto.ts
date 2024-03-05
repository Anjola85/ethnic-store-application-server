// import { ApiProperty } from '@nestjs/swagger';
// import { Type } from 'class-transformer';
// import {
//   IsEmail,
//   IsNotEmpty,
//   IsOptional,
//   IsString,
//   ValidateNested,
// } from 'class-validator';
// import { AddressDto } from 'src/common/dto/address.dto';
// import { MobileDto } from 'src/common/dto/mobile.dto';

// export class PersonDTO {
//   @IsNotEmpty()
//   @IsString()
//   @ApiProperty({ description: 'The first name of the person', example: 'John' })
//   firstname: string;

//   @IsNotEmpty()
//   @IsString()
//   @ApiProperty({ description: 'The last name of the person', example: 'Doe' })
//   lastname: string;

//   @IsNotEmpty()
//   @ApiProperty({
//     description: 'The address of the person',
//     example: {
//       primary: {
//         unit: '123',
//         street: 'Street 1',
//         city: 'City 1',
//         province: 'Province 1',
//         postalCode: '12345',
//         country: 'Country 1',
//       },
//       other: {
//         key1: {
//           unit: '123',
//           street: 'Street 1',
//           city: 'City 1',
//           province: 'Province 1',
//           postalCode: '12345',
//           country: 'Country 1',
//         },
//         key2: {
//           unti: '456',
//           street: 'Street 2',
//           city: 'City 2',
//           province: 'Province 2',
//           postalCode: '67890',
//           country: 'Country 2',
//         },
//       },
//     },
//   })
//   address: {
//     primary: AddressDto;
//     other?: {
//       [key: string]: AddressDto;
//     };
//   };

//   @IsOptional()
//   @IsEmail()
//   @ApiProperty({
//     description: 'The email address of the person',
//     example: 'johndoe@quickie.com',
//   })
//   email: string;

//   @IsOptional()
//   @ValidateNested()
//   @Type(() => MobileDto)
//   @ApiProperty({
//     description: 'The mobile phone number of the person',
//     example: { phone_number: '1234567890', country_code: '+1', iso_type: 'CA' },
//   })
//   mobile: MobileDto;

//   @IsNotEmpty()
//   @IsString()
//   @ApiProperty({
//     description: 'The type of user being resgistered',
//     example: 'customer',
//   })
//   user_profile: string;
// }
