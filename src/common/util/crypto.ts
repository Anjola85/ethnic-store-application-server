import { EnvConfigService } from 'src/config/env-config';
import * as crypto from 'crypto';
import { DecryptCommand, EncryptCommand, KMSClient } from '@aws-sdk/client-kms';

const iv = Buffer.from('EjRWeJ_aZpQ0TEhKT0dKSg==', 'base64');
const algorithm = 'AES-256-CBC';
const configService = new EnvConfigService();

const kmsClient = new KMSClient({
  region: 'ca-central-1',
  credentials: {
    accessKeyId: EnvConfigService.get('AWS_ACCESS_KEY'),
    secretAccessKey: EnvConfigService.get('AWS_SECRET_ACCESS_KEY'),
  },
});

export const encryptKms = async (buffer: Buffer) => {
  const params = {
    KeyId: EnvConfigService.get('AWS_KMS_KEY_ID'),
    Plaintext: buffer,
    EncryptionContext: {
      key: EnvConfigService.get('SECRET_KEY'),
    },
  };

  const command = new EncryptCommand(params);
  const encryptedBuffer = await kmsClient.send(command);

  const blobData = encryptedBuffer.CiphertextBlob;

  return blobData;
};

/**
 *
 * @param data - encrypted payload
 * @returns decrypted payload
 */
export const decryptPayload = async (data: string) => {
  try {
    const buffer = Buffer.from(data, 'base64');

    const params = {
      KeyId: EnvConfigService.get('AWS_KMS_KEY_ID'),
      CiphertextBlob: buffer,
      EncryptionContext: {
        key: EnvConfigService.get('SECRET_KEY'),
      },
    };

    const command = new DecryptCommand(params);
    const decryptedBuffer = await kmsClient.send(command);

    if (!decryptedBuffer.Plaintext) throw new Error('Error decrypting payload');

    const clearText = decryptedBuffer.Plaintext.toString();

    let decryptedData;

    if (clearText[0] === '{') decryptedData = JSON.parse(clearText);
    else decryptedData = clearText;

    return decryptedData;
  } catch (error) {
    console.log(`Error thrown in crypto.ts, decryptPayload method: ${error}`);
    throw new Error(error);
  }
};

export const encryptData = (keyIn: string, data: any): string => {
  const key: Buffer = Buffer.from(keyIn, 'base64');

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let stringifiedData: string;

  if (data instanceof Object) {
    try {
      stringifiedData = JSON.stringify(data, getCircularReplacer());
    } catch (error) {
      console.error(
        'Failed to stringify data in encryptData method in crypto.js ',
        error,
      );
    }
  } else {
    stringifiedData = data;
  }

  let encryptedData = cipher.update(stringifiedData, 'utf8', 'base64');

  encryptedData += cipher.final('base64');

  return encryptedData;
};

export const decryptData = (keyIn: string, cipherText: string): string => {
  const key: Buffer = Buffer.from(keyIn, 'base64');

  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decryptedData = decipher.update(cipherText, 'base64', 'utf-8');

  decryptedData += decipher.final('utf8');

  if (decryptedData[0] === '{') {
    decryptedData = JSON.parse(decryptedData);
  }

  return decryptedData;
};

export const toBuffer = (data: any) => {
  try {
    let buffer: Buffer;
    if (typeof data === 'string') {
      buffer = Buffer.from(data);
    } else if (typeof data === 'object' && data !== null) {
      const json = JSON.stringify(data, getCircularReplacer());
      buffer = Buffer.from(json);
    } else {
      throw new Error('Invalid data type. Expected string or object.');
    }
    return buffer;
  } catch (error) {
    console.error('Error thrown in toBuffer method in crypto.js ', error);
  }
};

export const encryptPayload = async (payload: {
  payload: any;
  status: boolean;
  message: string;
}) => {
  // convert payload to buffer
  const payloadToEncryptBuffer = toBuffer(payload);

  // encrypt payload
  const encryptedUserBlob = await encryptKms(payloadToEncryptBuffer);

  //TODO: convert encyrpted blob to base64 string
  const encryptedResp = encryptedUserBlob.toString();

  return encryptedResp;
};

function getCircularReplacer() {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        // Circular reference found, discard key
        return;
      }
      seen.add(value);
    }
    return value;
  };
}
