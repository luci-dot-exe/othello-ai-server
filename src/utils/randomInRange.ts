export function randomInRange(min: number, max: number) {
  const range = max - min;
  return Math.floor(min + Math.random() * range);
}
