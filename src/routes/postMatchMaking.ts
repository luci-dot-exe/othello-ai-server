import { RequestHandler } from "express";
import { matches, Matchmaking, matchmakings, users } from "../database";
import { internalServerError } from "../middlewares/responses";
import { randomUUID } from "crypto";
import { updateElement } from "../utils/updateElement";

export const postMatchMaking: RequestHandler = (request, response) => {
  const userId = request.body.userId as unknown;

  if (typeof userId !== "string") {
    return internalServerError(
      response,
      "Sanity error: No userId found on authenticated request!"
    );
  }

  const user = users.find((user) => user.userId === userId);
  if (user === undefined) {
    return internalServerError(response, "No user found with this userId!");
  }

  const availableMatchmaking = matchmakings.find(
    (m) => m.status === "SEARCHING_FOR_OPPONENT" && m.player1.userId !== userId
  );
  if (availableMatchmaking === undefined) {
    const matchmakingId = randomUUID();

    matchmakings.push({
      status: "SEARCHING_FOR_OPPONENT",
      matchmakingId,
      player1: user,
    });

    return response.send({ matchmakingId });
  }

  const matchId = randomUUID();

  matches.push({
    matchId,
    phase: "WAITING_FOR_PLAYER_1",
  });

  const updatedMatchmaking: Matchmaking = {
    ...availableMatchmaking,
    status: "MATCH_CREATED",
    player2: user,
    matchId,
  };

  updateElement(matchmakings, availableMatchmaking, updatedMatchmaking);

  return response.send({ matchmakingId: updatedMatchmaking.matchmakingId });
};
