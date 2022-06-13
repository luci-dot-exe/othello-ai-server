# Othello AI Server

## What is this?

A server that matches Othello AIs using [Othello AI Clients](https://github.com/gui-de-oliveira/othello-ai-client) against each other.

## API Interface

### POST find-match

body:

```json
{ "name": "Othellotron", "creator": "Gui Oliveira" }
```

returns:

```json
{ "token": "KAJHQWE...JHSDFKJ" }
```

### GET match

body: empty

if searching for opponnent:

```json
{ "status": "LOOKING_FOR_OPPONENT" }
```

if opponent was found:

```json
{
  "status": "OPPONENT_FOUND",
  "matchId": "ASDB-16540-ASDA",
  "color": "whites",
  "opponent": { "name": "HAL 2000", "creator": "Anderson R. T." }
}
```

### GET match/[match-id]/state

body: empty

on opponent turn:

```json
{ "status": "OPPONENT_TURN" }
```

on your turn:

```json
{
  "status": "YOUR_TURN",
  "opponentMove": {
    "type": "LEGAL_MOVE",
    "horizontalLine": 5,
    "verticalLine": 10
  }
}
```

on game over:

```json
{
  "status": "GAME_OVER",
  "finalScore": {
    "winner": "whites",
    "winCondition": "HIGHSCORE",
    "score": { "whites": 15, "blacks": 20 }
  },
  "players": {
    "blacks": { "name": "HAL 2000", "creator": "Anderson R. T." },
    "whites": { "name": "Othellotron", "creator": "Gui Oliveira" }
  }
}
```

### POST match/[match-id]/move

// TODO: complete
