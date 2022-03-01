import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { unauthorized } from "./responses";

export const authenticateJWT: (jwtSecret: string) => RequestHandler = (
  jwtSecret
) =>
  function (request, response, next) {
    const authorization = request.headers["authorization"];
    if (!authorization) {
      return response
        .status(401)
        .json({ message: "No authorization provided." });
    }

    const isJwt = authorization.startsWith("Bearer");
    if (!isJwt) {
      return unauthorized(response, "No JWT token provided.");
    }

    const token = authorization.replace("Bearer ", "");

    jwt.verify(token, jwtSecret, function (err: any, decoded: any) {
      if (err) {
        return unauthorized(response, "Failed to authenticate token.");
      }

      // I find this ugly. I'll try changing it later after implementing some better typing
      request.body.userId = decoded.userId;

      next();
    });
  };
