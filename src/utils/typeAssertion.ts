export function getProperty<T extends {}>(object: T, prop: string): unknown {
  // @ts-ignore
  // Type is already correct.
  // If object doesnt have the property [prop], it returns undefined,
  // which is already defined in the unknown type.
  return object[prop];
}

export function isValidObject(data: unknown): data is object {
  return typeof data === "object" && data !== null;
}

export function isOneOfTheValidValues<T>(
  validValues: readonly T[],
  value: unknown
): value is T {
  return validValues.some((v) => v === value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}
