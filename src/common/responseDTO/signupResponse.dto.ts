import { ApiProperty } from '@nestjs/swagger';

export class SignupResponseDtoEncrypted {
  @ApiProperty({
    example:
      'AQICAHjLuDRTnKVsgRzvUy74xztM2frynZUHkg/Nv5ZSxXo+PgHFpsjnMMuCFe5t1T4bXLHQAAADUTCCA00GCSqGSIb3DQEHBqCCAz4wggM6AgEAMIIDMwYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAzKWAON2yB1Qt7Gu6cCARCAggMEKVW2BgG9WrFSYjdDdDWn175juW',
    description: 'The encrypted payload of the signup response',
  })
  data: string;
}
