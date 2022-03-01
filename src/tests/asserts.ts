import axios, { AxiosInstance } from "axios";
import { startServer } from "../server";
import { randomInRange } from "../utils/randomInRange";

export function createAssertRequest(
  assertFn: (axios: AxiosInstance) => Promise<void>
): () => Promise<void> {
  return async () => {
    const TEST_JWT_SECRET = "TEST";
    const TEST_PORT = randomInRange(3000, 4000);

    const server = startServer(TEST_JWT_SECRET, TEST_PORT);
    const api = axios.create({
      baseURL: `http://localhost:${TEST_PORT}`,
    });

    await assertFn(api);
    server.close();
  };
}

function createAssertApiFailure(
  request: (api: AxiosInstance) => Promise<void>,
  expectedStatusCode: number,
  expectedMessage: string
): () => Promise<void> {
  return createAssertRequest(async (api) => {
    await request(api).then(
      function onSuccess() {
        fail();
      },
      function onFail(error) {
        if (!axios.isAxiosError(error)) {
          fail();
        }

        const { response } = error;
        if (response === undefined) {
          fail();
        }

        expect(response.status).toBe(expectedStatusCode);
        expect(response.data.message).toBe(expectedMessage);
      }
    );
  });
}

export function createAssertBadRequest(
  request: (api: AxiosInstance) => Promise<void>,
  expectedMessage: string
): () => Promise<void> {
  const BAD_REQUEST_STATUS_CODE = 400;
  return createAssertApiFailure(
    request,
    BAD_REQUEST_STATUS_CODE,
    expectedMessage
  );
}

export function createAssertUnauthorized(
  request: (api: AxiosInstance) => Promise<void>,
  expectedMessage: string
): () => Promise<void> {
  const UNAUTHORIZED_STATUS_CODE = 401;
  return createAssertApiFailure(
    request,
    UNAUTHORIZED_STATUS_CODE,
    expectedMessage
  );
}
