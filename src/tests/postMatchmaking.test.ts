import { createAssertRequest, createAssertUnauthorized } from "./asserts";

test(
  "POST matchmaking with no token returns unauthorized",
  createAssertUnauthorized(
    async (api) => await api.post("matchmaking"),
    "No authorization provided."
  )
);

test(
  "POST matchmaking with invalid token returns unauthorized",
  createAssertUnauthorized(
    async (api) =>
      await api.post(
        "matchmaking",
        {},
        { headers: { authorization: "Bearer INVALID_TOKEN" } }
      ),
    "Failed to authenticate token."
  )
);

test(
  "POST matchmaking with token returns matchmakingId",
  createAssertRequest(async (api) => {
    const jwtToken = await api
      .post<{ token: string }>("register", {
        username: "Player1",
      })
      .then((response) => response.data.token);

    const response = await api.post<{ matchmakingId: string }>(
      "matchmaking",
      {},
      {
        headers: { Authorization: `Bearer ${jwtToken}` },
      }
    );

    expect(response.status).toBe(200);
    expect(typeof response.data.matchmakingId).toBe("string");
  })
);
