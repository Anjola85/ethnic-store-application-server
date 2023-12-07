import * as crypto from 'crypto';
import * as aws from 'aws-sdk';
import { AwsSecretKey } from './secret';

const iv = Buffer.from('EjRWeJ_aZpQ0TEhKT0dKSg==', 'base64');
const algorithm = 'AES-256-CBC';

export const encryptKms = async (buffer: Buffer) => {
  const kmsClient = new aws.KMS({
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  });

  // const awsSecretKey = new AwsSecretKey();

  // const key = await awsSecretKey.getSecretKey()
  const key = process.env.SECRET_KEY;

  const params = {
    KeyId: process.env.AWS_KMS_KEY_ID,
    Plaintext: buffer,
    EncryptionContext: {
      key,
    },
  };

  const encryptedBuffer = await kmsClient.encrypt(params).promise();

  const blobData = encryptedBuffer.CiphertextBlob;

  return blobData;
};

/**
 *
 * @param buffer - CipherTextBlob
 * @returns
 */
export const decryptKms = async (data: string) => {
  const buffer: AWS.KMS.CiphertextType = Buffer.from(data, 'base64');

  const kmsClient = new aws.KMS({
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  });

  // const awsSecretKey = new AwsSecretKey();
  // const key = await awsSecretKey.getSecretKey();
  const key = process.env.SECRET_KEY;

  const params = {
    KeyId: process.env.AWS_KMS_KEY_ID,
    CiphertextBlob: buffer,
    EncryptionContext: {
      key,
    },
  };

  const decryptedBuffer = await kmsClient.decrypt(params).promise();

  const clearText = decryptedBuffer.Plaintext.toString();

  let decryptedData;

  // check if clearText is a JSON object
  if (clearText[0] === '{') {
    decryptedData = JSON.parse(clearText);
  } else {
    decryptedData = clearText;
  }

  return decryptedData;
};

export const encryptData = (keyIn: string, data: any): string => {
  const key: Buffer = Buffer.from(keyIn, 'base64');

  // create encryptor
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  if (data instanceof Object) {
    data = JSON.stringify(data);
  }

  let encryptedData = cipher.update(data, 'utf8', 'base64');

  encryptedData += cipher.final('base64');

  return encryptedData;
};

export const decryptData = (keyIn: string, cipherText: string): string => {
  const key: Buffer = Buffer.from(keyIn, 'base64');

  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decryptedData = decipher.update(cipherText, 'base64', 'utf-8');

  decryptedData += decipher.final('utf8');

  // check if decrypted data is a JSON object
  if (decryptedData[0] === '{') {
    decryptedData = JSON.parse(decryptedData);
  }

  return decryptedData;
};

export const toBuffer = (data: any) => {
  let buffer: Buffer;
  if (typeof data === 'string') {
    buffer = Buffer.from(data);
  } else if (typeof data === 'object' && data !== null) {
    const json = JSON.stringify(data);
    buffer = Buffer.from(json);
  } else {
    throw new Error('Invalid data type. Expected string or object.');
  }
  return buffer;
};