import * as AWS from 'aws-sdk';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AwsSecretKey {
  private secretKey: string;

  async retrieveSecretKey(): Promise<void> {
    if (!this.secretKey) {
      try {
        const secretName = 'payload-key';

        const client = new AWS.SecretsManager({
          region: 'us-east-1',
        });

        const data = await client
          .getSecretValue({ SecretId: secretName })
          .promise();

        if ('SecretString' in data) {
          const secret = JSON.parse(data.SecretString);
          this.secretKey = secret.key;
        } else {
          throw new Error('Unable to retrieve key');
        }
      } catch (error) {
        throw new Error('Error retrieving secret key from AWS');
      }
    }
  }

  async getSecretKey(): Promise<string> {
    if (!this.secretKey) {
      await this.retrieveSecretKey();
    }
    return this.secretKey;
  }
}
