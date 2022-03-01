import axios from "axios";
import { startServer } from "../server";

let i = 0;
const startTestServer = () => {
  const TEST_JWT_SECRET = "TEST";
  const TEST_PORT = 3157;

  i += 1;

  startServer(TEST_JWT_SECRET, TEST_PORT + i);

  const testAxios = axios.create({
    baseURL: `http://localhost:${TEST_PORT + i}`,
  });

  return testAxios;
};

test("POST Register returns a token", async () => {
  const testAxios = startTestServer();

  const response = await testAxios.post<{ token: string }>(`register`, {
    username: "PLAYER_1",
  });

  expect(typeof response.data.token).toBe("string");
});

test("POST Register with no username returns a bad request", async () => {
  const testAxios = startTestServer();

  try {
    await testAxios.post<{ token: string }>(`register`);
    fail();
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      fail();
    }

    const errorMessage = error.response?.data.message;
    expect(errorMessage).toBe("Username field not found");
  }
});
