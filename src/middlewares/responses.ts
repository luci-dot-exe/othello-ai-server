import { Response } from "express";

export function badRequest(response: Response, message: string) {
  return response.status(400).json({ message });
}

export function unauthorized(response: Response, message: string) {
  return response.status(401).json({ message });
}

export function internalServerError(response: Response, message: string) {
  return response.status(500).json({ message });
}
