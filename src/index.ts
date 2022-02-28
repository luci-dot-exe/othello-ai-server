import express, { Application } from "express";

const SERVER_PORT = 3000;

async function startServer() {
  const app: Application = express();
  app.set("port", SERVER_PORT);

  app.get("/", function (_request, res) {
    res.send("GET request to the homepage");
  });

  app.listen(app.get("port"), () => {
    console.log(`Server on port ${app.get("port")}`);
  });
}

startServer();
