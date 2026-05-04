export const friendlyErrorMessage = (
  error,
  fallback = "We couldn't complete that request. Please try again."
) => {
  const status = error?.status;
  const rawMessage = String(error?.message || '').trim();
  const message = rawMessage.toLowerCase();

  if (rawMessage === 'Failed to fetch' || message.includes('networkerror')) {
    return "We couldn't reach the server. Please check your connection.";
  }

  if (message.includes('timeout') || message.includes('timed out')) {
    return 'The server is taking longer than expected. Please try again in a moment.';
  }

  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return "You don't have permission to perform this action.";
  if (status === 404) return "We couldn't find the requested information.";
  if (status >= 500) return 'The service is temporarily unavailable. Please try again shortly.';

  if (
    message.includes('bad credentials') ||
    message.includes('invalid credentials') ||
    message.includes('identifier or password')
  ) {
    return 'The ID or password you entered is incorrect.';
  }

  if (message.includes('email') && (message.includes('exists') || message.includes('already'))) {
    return 'An account with this email already exists.';
  }

  if (message.includes('mechanic') && message.includes('exists')) {
    return 'A mechanic with this ID already exists.';
  }

  if (message.includes('duplicate') || message.includes('constraint')) {
    return 'This information already exists. Please review your details.';
  }

  if (message.includes('jwt') || message.includes('token')) {
    return 'Your session has expired. Please sign in again.';
  }

  if (
    message.includes('exception') ||
    message.includes('trace') ||
    message.includes('sql') ||
    message.includes('hibernate') ||
    message.includes('null') ||
    rawMessage.startsWith('{')
  ) {
    return fallback;
  }

  return rawMessage || fallback;
};
