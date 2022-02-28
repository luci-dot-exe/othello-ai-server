import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { JWT_SECRET } from "../index";
import { badRequest } from "../middlewares/responses";

export const postRegister: RequestHandler = function postRegister(
  request,
  response
) {
  const username = request.body.username as unknown;

  if (typeof username !== "string") {
    return badRequest(response, "Username field not found");
  }

  const userId = randomUUID();

  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "10d" });

  return response.json({ token });
};
