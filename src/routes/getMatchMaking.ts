import { RequestHandler } from "express";
import { matches, playersLookingForMatches } from "../database";
import { badRequest, internalServerError } from "../middlewares/responses";

export const getMatchMaking: RequestHandler = (request, response) => {
  const userId = request.body.userId as unknown;

  if (typeof userId !== "string") {
    return internalServerError(
      response,
      "Sanity error: No userId found on authenticated request!"
    );
  }

  const isUserOnQueue = playersLookingForMatches.some(
    (id) => id.userId === userId
  );
  if (isUserOnQueue) {
    return response.send({ status: "SEARCHING_OPPONENT" });
  }

  const match = matches.find(
    (match) =>
      match.playerW.userId === userId || match.playerB.userId === userId
  );

  if (match === undefined) {
    return badRequest(response, "User didnt enter queue.");
  }

  const opponent =
    userId === match.playerW.userId ? match.playerB : match.playerW;

  return response.send({
    status: "OPPONENT_FOUND",
    matchId: match.matchId,
    opponent,
  });
};
