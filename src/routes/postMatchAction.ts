import { RequestHandler } from "express";
import { updateElement } from "../utils/updateElement";
import { matches } from "../database";
import { badRequest, internalServerError } from "../middlewares/responses";
import { tryToNormalizeAction } from "../utils/tryToNormalizeAction";

type PiecePosition = [number, number];

export type MatchResult = {
  winner: "PLAYER_W" | "PLAYER_B" | "DRAW";
  endCondition: "NO_AVAILABLE_MOVE" | "TOO_MANY_ILLEGAL_MOVES";
  score: { white: number; black: number; empty: number };
};

export type DisputeReason =
  | "MISMATCH_END_CONDITION"
  | "ILLEGAL_MOVE_ATTEMPT"
  | "INVALID_ACTION";

export type Action =
  | { type: "START_GAME" }
  | { type: "LEGAL_MOVE"; piecePosition: PiecePosition }
  | { type: "ILLEGAL_MOVE"; piecePosition: PiecePosition }
  | { type: "NO_LEGAL_MOVE" }
  | {
      type: "DISPUTE";
      reason: DisputeReason;
    }
  | { type: "GAME_OVER"; result: MatchResult }
  | { type: "CONFIRM_RESULT" };

export const postMatchAction: RequestHandler = (request, response) => {
  const userId = request.body.userId as unknown;

  if (typeof userId !== "string") {
    return internalServerError(
      response,
      "Sanity error: No userId found on authenticated request!"
    );
  }

  const matchId = request.params.matchId as unknown;

  if (typeof matchId !== "string") {
    return internalServerError(
      response,
      "Sanity error: MatchId not found on path"
    );
  }

  const match = matches.find((match) => match.matchId === matchId);

  if (match === undefined) {
    return badRequest(response, "Match not found");
  }

  const result = tryToNormalizeAction(request.body);
  if (result.tag === "fail") {
    return badRequest(response, "Invalid body");
  }

  const { action } = result;

  if (match.phase === "WAITING_FOR_PLAYER_1") {
    if (action.type !== "START_GAME") {
      return badRequest(response, "Invalid action. Expecting START_GAME.");
    }

    return updateElement(matches, match, {
      ...match,
      phase: "WAITING_FOR_PLAYER_2",
      player1Id: userId,
      onPlayer2Connected: (action: { type: "START_GAME" }) => {
        response.send(action);
      },
    });
  }

  if (match.phase === "WAITING_FOR_PLAYER_2") {
    if (action.type !== "START_GAME") {
      return badRequest(response, "Invalid action. Expecting START_GAME.");
    }

    if (match.player1Id === userId) {
      return badRequest(response, "You're already player 1");
    }

    updateElement(matches, match, {
      ...match,
      phase: "PLAYER_1_TURN",
      player2Id: userId,
      onPlayer1Action: (action) => {
        response.send(action);
      },
    });

    return match.onPlayer2Connected(action);
  }

  const isPlayer1 = match.player1Id === userId;
  const isPlayer2 = match.player2Id === userId;

  if (!isPlayer1 && !isPlayer2) {
    return badRequest(response, "Invalid user.");
  }

  if (match.phase === "PLAYER_1_TURN") {
    if (!isPlayer1) {
      return badRequest(response, "Wait your turn");
    }

    if (action.type === "DISPUTE") {
      updateElement(matches, match, {
        ...match,
        phase: "DISPUTE",
        reason: action.reason,
      });

      return match.onPlayer1Action(action);
    }

    if (action.type === "GAME_OVER") {
      updateElement(matches, match, {
        ...match,
        phase: "WAITING_FOR_CONSENSUS_OF_PLAYER_2",
        result: action.result,
      });

      match.onPlayer1Action(action);

      return response.send();
    }

    updateElement(matches, match, {
      ...match,
      phase: "PLAYER_2_TURN",
      onPlayer2Action: (action) => {
        response.send(action);
      },
    });

    return match.onPlayer1Action(action);
  }

  if (match.phase === "PLAYER_2_TURN") {
    if (!isPlayer2) {
      return badRequest(response, "Wait your turn");
    }

    if (action.type === "DISPUTE") {
      updateElement(matches, match, {
        ...match,
        phase: "DISPUTE",
        reason: action.reason,
      });

      return match.onPlayer2Action(action);
    }

    if (action.type === "GAME_OVER") {
      updateElement(matches, match, {
        ...match,
        phase: "WAITING_FOR_CONSENSUS_OF_PLAYER_1",
        result: action.result,
      });

      response.send();

      return match.onPlayer2Action(action);
    }

    updateElement(matches, match, {
      ...match,
      phase: "PLAYER_1_TURN",
      onPlayer1Action: (action) => {
        response.send(action);
      },
    });

    return match.onPlayer2Action(action);
  }

  if (
    match.phase === "WAITING_FOR_CONSENSUS_OF_PLAYER_1" ||
    match.phase === "WAITING_FOR_CONSENSUS_OF_PLAYER_2"
  ) {
    if (!isPlayer1 && match.phase === "WAITING_FOR_CONSENSUS_OF_PLAYER_1") {
      return badRequest(response, "Wait your turn");
    }

    if (!isPlayer2 && match.phase === "WAITING_FOR_CONSENSUS_OF_PLAYER_2") {
      return badRequest(response, "Wait your turn");
    }

    if (action.type !== "CONFIRM_RESULT" && action.type !== "DISPUTE") {
      return badRequest(response, "Please confirm or dispute the result");
    }

    if (action.type === "DISPUTE") {
      updateElement(matches, match, {
        ...match,
        phase: "DISPUTE",
        reason: action.reason,
      });

      return response.send();
    }

    updateElement(matches, match, {
      ...match,
      phase: "GAME_OVER",
    });

    return response.send();
  }
};
