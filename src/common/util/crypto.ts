import * as crypto from 'crypto';
import * as aws from 'aws-sdk';
import { AwsSecretKey } from './secret';

const iv = Buffer.from('EjRWeJ_aZpQ0TEhKT0dKSg==', 'base64');
const algorithm = 'AES-256-CBC';

export const encryptKms = async (buffer: Buffer) => {
  const kmsClient = new aws.KMS({
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  const params = {
    KeyId: process.env.AWS_KMS_KEY_ID,
    Plaintext: buffer,
    EncryptionContext: {
      key: process.env.SECRET_KEY,
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
  try {
    const buffer: AWS.KMS.CiphertextType = Buffer.from(data, 'base64');
    // console.log('buffer: ', buffer);

    const kmsClient = new aws.KMS({
      region: 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    // console.log('kmsClient: ', kmsClient);

    const params = {
      KeyId: process.env.AWS_KMS_KEY_ID,
      CiphertextBlob: buffer,
      EncryptionContext: {
        key: process.env.SECRET_KEY,
      },
    };
    // console.log('params: ', params);

    //TODO: error below
    const decryptedBuffer = await kmsClient.decrypt(params).promise();

    // console.log('decryptedBuffer: ', decryptedBuffer);

    const clearText = decryptedBuffer.Plaintext.toString();

    // console.log('clearText: ', clearText);

    let decryptedData;

    // check if clearText is a JSON object
    if (clearText[0] === '{') {
      decryptedData = JSON.parse(clearText);
    } else {
      decryptedData = clearText;
    }

    return decryptedData;
  } catch (error) {
    console.log(`Error thrown in crypto.ts, decryptKms method: ${error}`);
  }
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

export const encryptPayload = async (payload: {
  payload: any;
  status: boolean;
  message: string;
}) => {
  // convert payload to buffer
  const payloadToEncryptBuffer = toBuffer(payload);

  // encrypt payload
  const encryptedUserBlob = await encryptKms(payloadToEncryptBuffer);

  // convert encyrpted blob to base64 string
  const encryptedResp = encryptedUserBlob.toString('base64');

  return encryptedResp;
};
