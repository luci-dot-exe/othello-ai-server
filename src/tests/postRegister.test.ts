import { assertRequest, assertBadRequest } from "./asserts";

test(
  "POST Register returns a token",
  assertRequest(async (axios) => {
    const response = await axios.post<{ token: string }>(`register`, {
      username: "PLAYER_1",
    });

    expect(typeof response.data.token).toBe("string");
  })
);

test(
  "POST Register with no username returns a bad request",
  assertBadRequest(
    async (api) => await api.post("register"),
    "Username field not found"
  )
);
