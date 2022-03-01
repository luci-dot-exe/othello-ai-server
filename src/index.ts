import { startServer } from "./server";
require("dotenv").config();

if (process.env.JWT_SECRET === undefined) {
  console.log("JWT_SECRET NOT FOUND!");
  process.exit();
}

const { JWT_SECRET } = process.env;

const SERVER_PORT = 3001;
startServer(JWT_SECRET, SERVER_PORT);
