import { EncryptedDTO } from "../dto/encrypted.dto";
import { Response } from "express";
import { HttpStatus } from "@nestjs/common";
import { encryptPayload } from "./crypto";

export interface  ApiResponse {
  message?: string,
  payload: any,
  status: boolean
}

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
  return {
    payload: encryptedData,
  };
}

/**
 * Encrypts the payload based on if cryptoresp is set to true
 * @param res
 * @param result
 */
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


export enum TokenIdType {
  authId,
  userId
}

export function extractIdFromRequest(res: Response, tokenIdType: TokenIdType): number {
  let id: number;
  if(tokenIdType === TokenIdType.userId)
    id = res.locals.userId;
  else if(tokenIdType === TokenIdType.authId)
    id = res.locals.authId;

  if(id == undefined || id == null)
    throw new Error("Unable to extract id from token")

  return id;
}