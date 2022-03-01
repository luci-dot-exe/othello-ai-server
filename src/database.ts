import { Action } from "./routes/postMatchAction";

type User = { userId: string; username: string };
export const users: User[] = [];

export type Matchmaking = {
  matchmakingId: string;
  player1: User;
} & (
  | {
      status: "SEARCHING_FOR_OPPONENT";
    }
  | { status: "MATCH_CREATED"; player2: User; matchId: string }
);

export const matchmakings: Matchmaking[] = [];

type Match = {
  matchId: string;
} & (
  | {
      phase: "WAITING_FOR_PLAYER_1";
    }
  | {
      phase: "WAITING_FOR_PLAYER_2";
      player1Id: string;
      onPlayer2Connected: (action: { type: "START_GAME" }) => void;
    }
  | ({ player1Id: string; player2Id: string } & (
      | { phase: "PLAYER_1_TURN"; onPlayer1Action: (action: Action) => void }
      | { phase: "PLAYER_2_TURN"; onPlayer2Action: (action: Action) => void }
    ))
);

export const matches: Match[] = [];
