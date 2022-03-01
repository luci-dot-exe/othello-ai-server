import { Result, fail, ok } from "./result";
import {
  isValidObject,
  getProperty,
  isOneOfTheValidValues,
  isArray,
} from "./typeAssertion";
import { Action } from "../routes/postMatchAction";

export const tryToNormalizeAction = (
  data: unknown
): Result<{ action: Action }> => {
  if (!isValidObject(data)) {
    return fail({});
  }

  const VALID_ACTION_TYPES = [
    "START_GAME",
    "LEGAL_MOVE",
    "ILLEGAL_MOVE",
    "NO_LEGAL_MOVE",
    "DISPUTE",
    "GAME_OVER",
    "CONFIRM_RESULT",
  ] as const;

  const type = getProperty(data, "type");
  if (!isOneOfTheValidValues(VALID_ACTION_TYPES, type)) {
    return fail({});
  }

  if (
    type === "START_GAME" ||
    type === "CONFIRM_RESULT" ||
    type === "NO_LEGAL_MOVE"
  ) {
    return ok({ action: { type } });
  }

  if (type === "DISPUTE") {
    const VALID_DISPUTE_REASONS = [
      "MISMATCH_END_CONDITION",
      "ILLEGAL_MOVE_ATTEMPT",
      "INVALID_ACTION",
    ] as const;

    const reason = getProperty(data, "reason");
    if (!isOneOfTheValidValues(VALID_DISPUTE_REASONS, reason)) {
      return fail({});
    }

    return ok({
      action: { type: "DISPUTE", reason },
    });
  }

  if (type === "ILLEGAL_MOVE" || type === "LEGAL_MOVE") {
    const piecePosition = getProperty(data, "piecePosition");
    if (!isArray(piecePosition)) {
      return fail({});
    }

    if (piecePosition.length !== 2) {
      return fail({});
    }

    const positionX = piecePosition[0];
    if (typeof positionX !== "number") {
      return fail({});
    }

    const positionY = piecePosition[1];
    if (typeof positionY !== "number") {
      return fail({});
    }

    return ok({ action: { type, piecePosition: [positionX, positionY] } });
  }

  const result = getProperty(data, "result");

  if (!isValidObject(result)) {
    return fail({});
  }

  const VALID_END_CONDITIONS = [
    "NO_AVAILABLE_MOVE",
    "TOO_MANY_ILLEGAL_MOVES",
  ] as const;

  const endCondition = getProperty(result, "endCondiction");
  if (!isOneOfTheValidValues(VALID_END_CONDITIONS, endCondition)) {
    return fail({});
  }

  const score = getProperty(result, "score");
  if (!isValidObject(score)) {
    return fail({});
  }

  const white = getProperty(score, "white");
  if (typeof white !== "number") {
    return fail({});
  }

  const black = getProperty(score, "black");
  if (typeof black !== "number") {
    return fail({});
  }

  const empty = getProperty(score, "empty");
  if (typeof empty !== "number") {
    return fail({});
  }

  return ok({
    action: {
      type: "GAME_OVER",
      result: {
        score: { white, black, empty },
        endCondition,
        winner: "PLAYER_W",
      },
    },
  });
};
