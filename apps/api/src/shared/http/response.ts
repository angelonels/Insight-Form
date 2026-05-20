import type { Response } from "express";

export type SuccessEnvelope<TData, TMeta = never> = [TMeta] extends [never]
  ? { data: TData }
  : { data: TData; meta: TMeta };

export function ok<TData>(response: Response, data: TData) {
  return response.status(200).json({ data });
}

export function created<TData>(response: Response, data: TData) {
  return response.status(201).json({ data });
}

export function noContent(response: Response) {
  return response.status(204).send();
}
