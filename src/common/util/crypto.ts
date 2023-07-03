import * as crypto from 'crypto';
import * as aws from 'aws-sdk';
import { AwsSecretKey } from './secret';

const iv = Buffer.from('00000000000000000000000000000000', 'hex');
const algorithm = 'AES-256-CBC';

export const encryptKms = async (buffer: Buffer) => {
  const kmsClient = new aws.KMS({
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  });

  const awsSecretKey = new AwsSecretKey();

  const key = await awsSecretKey.getSecretKey();

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
  const buffer: AWS.KMS.CiphertextType = Buffer.from(data, 'hex');

  const kmsClient = new aws.KMS({
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  });

  const awsSecretKey = new AwsSecretKey();

  const key = await awsSecretKey.getSecretKey();

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
  const key: Buffer = Buffer.from(keyIn, 'hex');

  // create encryptor
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  if (data instanceof Object) {
    data = JSON.stringify(data);
  }

  let encryptedData = cipher.update(data, 'utf8', 'hex');

  encryptedData += cipher.final('hex');

  return encryptedData;
};

export const decryptData = (keyIn: string, cipherText: string): string => {
  const key: Buffer = Buffer.from(keyIn, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  let decryptedData = decipher.update(cipherText, 'hex', 'utf-8');

  decryptedData += decipher.final('utf8');

  // check if decrypted data is a JSON object
  if (decryptedData[0] === '{') {
    decryptedData = JSON.parse(decryptedData);
  }

  return decryptedData;
};
