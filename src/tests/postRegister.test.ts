import { createAssertRequest, createAssertBadRequest } from "./asserts";

test(
  "POST Register returns a token",
  createAssertRequest(async (axios) => {
    const response = await axios.post<{ token: string }>(`register`, {
      username: "Player1",
    });

    expect(response.status).toBe(200);
    expect(typeof response.data.token).toBe("string");
  })
);

test(
  "POST Register with no username returns a bad request",
  createAssertBadRequest(
    async (api) => await api.post("register"),
    "Username field not found"
  )
);
