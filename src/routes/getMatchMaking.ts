import { RequestHandler } from "express";
import { matchmakings } from "../database";
import { badRequest, internalServerError } from "../middlewares/responses";

export const getMatchMaking: RequestHandler = (request, response) => {
  const userId = request.body.userId as unknown;

  if (typeof userId !== "string") {
    return internalServerError(
      response,
      "Sanity error: No userId found on authenticated request!"
    );
  }

  const matchmakingId = request.params.matchmakingId as unknown;
  if (typeof matchmakingId !== "string") {
    return internalServerError(
      response,
      "Sanity error: No matchmakingId found on params"
    );
  }

  const matchmaking = matchmakings.find(
    (m) => m.matchmakingId === matchmakingId
  );
  if (matchmaking === undefined) {
    return badRequest(response, "No matchmaking found");
  }

  const isUserPlayer1 = matchmaking.player1.userId === userId;
  const isUserPlayer2 =
    matchmaking.status === "MATCH_CREATED" &&
    matchmaking.player2.userId === userId;

  if (!isUserPlayer1 && !isUserPlayer2) {
    return badRequest(response, "No matchmaking found");
  }

  if (matchmaking.status === "SEARCHING_FOR_OPPONENT") {
    return response.send({ status: "SEARCHING_OPPONENT" });
  }

  const { player1, player2 } = matchmaking;
  const opponent = isUserPlayer1 ? player2 : player1;

  return response.send({
    status: "OPPONENT_FOUND",
    matchId: matchmaking.matchId,
    opponent,
  });
};
