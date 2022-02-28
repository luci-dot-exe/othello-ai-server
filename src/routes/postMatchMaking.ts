import { RequestHandler } from "express";
import { matches, playersLookingForMatches, users } from "../database";
import { internalServerError } from "../middlewares/responses";
import { randomUUID } from "crypto";

export const postMatchMaking: RequestHandler = (request, response) => {
  const userId = request.body.userId as unknown;

  if (typeof userId !== "string") {
    return internalServerError(
      response,
      "Sanity error: No userId found on authenticated request!"
    );
  }

  const isUserAlreadyOnQueue = playersLookingForMatches.some(
    (id) => id.userId === userId
  );
  if (isUserAlreadyOnQueue) {
    return response.status(200).send();
  }

  if (playersLookingForMatches.length == 0) {
    playersLookingForMatches.push({ userId });
    return response.status(200).send();
  }

  const queuedPlayer = playersLookingForMatches.pop();

  if (queuedPlayer === undefined) {
    return internalServerError(response, "Sanity error: No player queued.");
  }

  const matchId = randomUUID();

  const playerW = users.find((user) => user.userId === queuedPlayer.userId);
  const playerB = users.find((user) => user.userId === userId);

  if (playerW === undefined || playerB === undefined) {
    return internalServerError(response, "UserId not found on users.");
  }

  matches.push({
    matchId,
    playerW,
    playerB,
    lastMove: null,
    playerTurn: "W",
  });

  return response.status(200).send();
};
