type User = { userId: string; username: string };
export const users: User[] = [];

export const playersLookingForMatches: { userId: string }[] = [];

type Match = {
  matchId: string;
  playerW: User;
  playerB: User;
  playerTurn: "W" | "B";
  lastMove: [number, number] | null;
};

export const matches: Match[] = [];
