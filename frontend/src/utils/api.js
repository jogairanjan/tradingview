/**
 * Unwrap standard API response: { success, message, data }
 */
export function unwrapApi(response) {
  return response?.data?.data ?? response?.data ?? response;
}
