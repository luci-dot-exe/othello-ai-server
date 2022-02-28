import express, { Application } from "express";
import bodyParser from "body-parser";
import { authenticateJWT } from "./middlewares/authenticateJWT";
import { corsMiddleware } from "./middlewares/corsMiddleware";
import { postRegister } from "./routes/postRegister";
import { users } from "./database";
require("dotenv").config();

const SERVER_PORT = 3000;

if (process.env.JWT_SECRET === undefined) {
  console.log("JWT_SECRET NOT FOUND!");
  process.exit();
}

export const { JWT_SECRET } = process.env;

async function startServer() {
  const app: Application = express();

  app.use(corsMiddleware);
  app.use(bodyParser.json());
  app.set("port", SERVER_PORT);

  app.post("/register", postRegister);

  app.get("/test-authentication", authenticateJWT, (request, response) => {
    return response.json(
      users.find((user) => user.userId === request.body.userId)
    );
  });

  app.listen(app.get("port"), () => {
    console.log(`Server on port ${app.get("port")}`);
  });
}

startServer();
