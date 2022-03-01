export function updateElement<T>(array: T[], currentValue: T, updatedValue: T) {
  const index = array.indexOf(currentValue);
  array[index] = updatedValue;
}
