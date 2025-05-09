
/**
 * Generates a unique ID for use in the application
 * @param prefix Optional prefix for the ID
 * @returns A string ID that is guaranteed to be unique
 */
export function generateUniqueId(prefix: string = 'id'): string {
  const timestamp = Date.now();
  const randomPart = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${randomPart}`;
}
