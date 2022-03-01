type Fail<T = {}> = { tag: "fail" } & T;
type Success<T = {}> = { tag: "success" } & T;

export type Result<S = {}, F = {}> = Success<S> | Fail<F>;
export function fail<F>(value: F): Fail<F> {
  return { tag: "fail", ...value };
}

export function ok<S>(value: S): Success<S> {
  return { tag: "success", ...value };
}
