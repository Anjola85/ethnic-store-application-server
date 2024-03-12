import { EncryptedDTO } from '../dto/encrypted.dto';
import { Response } from 'express';
import { HttpStatus } from "@nestjs/common";
import { encryptPayload } from "./crypto";

export function createResponse(
  message?: string,
  payload = null,
  status = true,
) {
  return {
    status,
    message,
    payload,
  };
}

export function createError(message: string, error?: any) {
  return {
    message,
    error,
  };
}

export function createEncryptedResponse(encryptedData: string): EncryptedDTO {
  const resp: EncryptedDTO = {
    payload: encryptedData,
  };
  return resp;
}

export async function handleCustomResponse(res: Response, result: any) {
  const cryptoresp = res.locals.cryptresp;

  if (cryptoresp !== "false") {
    return res.status(HttpStatus.OK).json(result);
  }

  const encryptedResp: string = await encryptPayload(result);
  return res
    .status(HttpStatus.OK)
    .json(createEncryptedResponse(encryptedResp));
}
