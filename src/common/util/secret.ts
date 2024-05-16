// import { Injectable } from '@nestjs/common';
// // import * as aws from 'aws-sdk-js-codemod';

// @Injectable()
// export class AwsSecretKey {
//   private secretKey: string;

//   async retrieveSecretKey(): Promise<void> {
//     if (!this.secretKey) {
//       try {
//         const secretName = 'payload-key';

//         const client = new SecretsManager({
//           region: 'us-east-1',
//         });

//         const data = await client
//           .getSecretValue({ SecretId: secretName })
//           .promise();

//         if ('SecretString' in data) {
//           const secret = JSON.parse(data.SecretString);
//           this.secretKey = secret.key;
//         } else {
//           throw new Error('Unable to retrieve key');
//         }
//       } catch (error) {
//         throw new Error('Error retrieving secret key from AWS');
//       }
//     }
//   }

//   async getSecretKey(): Promise<string> {
//     // return '0552a0ff92089afd18ae31c1bf7bc73c75da12e9ab0369cfeff90e5f19b2112fquickie';
//     return process.env.SECRET_KEY;
//     // if (!this.secretKey) {
//     //   await this.retrieveSecretKey();
//     // }
//     // return this.secretKey;
//   }
// }
