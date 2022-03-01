import express, { Application } from "express";
import bodyParser from "body-parser";
import { authenticateJWT } from "./middlewares/authenticateJWT";
import { corsMiddleware } from "./middlewares/corsMiddleware";
import { postRegister } from "./routes/postRegister";
import { users } from "./database";
import { postMatchMaking } from "./routes/postMatchMaking";
import { getMatchMaking } from "./routes/getMatchMaking";
import { postMatchAction } from "./routes/postMatchAction";

export function startServer(jwtSecret: string, port: number) {
  const app: Application = express();

  app.use(corsMiddleware);
  app.use(bodyParser.json());

  app.post("/register", postRegister(jwtSecret));

  app.get(
    "/test-authentication",
    authenticateJWT(jwtSecret),
    (request, response) => {
      return response.json(
        users.find((user) => user.userId === request.body.userId)
      );
    }
  );

  app.post("/matchmaking", authenticateJWT(jwtSecret), postMatchMaking);
  app.get(
    "/matchmaking/:matchmakingId",
    authenticateJWT(jwtSecret),
    getMatchMaking
  );

  app.post(
    "/matches/:matchId/action",
    authenticateJWT(jwtSecret),
    postMatchAction
  );

  const server = app.listen(port);

  return server;
}
