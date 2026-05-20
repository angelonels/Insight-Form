import type { Request } from "express";
import type { z } from "zod";

export function parseBody<TSchema extends z.ZodTypeAny>(request: Request, schema: TSchema): z.infer<TSchema> {
  return schema.parse(request.body);
}

export function parseParams<TSchema extends z.ZodTypeAny>(request: Request, schema: TSchema): z.infer<TSchema> {
  return schema.parse(request.params);
}

export function parseQuery<TSchema extends z.ZodTypeAny>(request: Request, schema: TSchema): z.infer<TSchema> {
  return schema.parse(request.query);
}
