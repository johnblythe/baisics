// Dev-only: stores the latest magic link for display on verify page
// This is only used in development mode

let devMagicLink: { url: string; email: string; timestamp: number } | null = null;

export function setDevMagicLink(email: string, url: string) {
  if (process.env.NODE_ENV === 'production') return;
  devMagicLink = { url, email, timestamp: Date.now() };
}

export function getDevMagicLink() {
  if (process.env.NODE_ENV === 'production') return null;
  // Expire after 5 minutes
  if (devMagicLink && Date.now() - devMagicLink.timestamp > 5 * 60 * 1000) {
    devMagicLink = null;
  }
  return devMagicLink;
}

export function clearDevMagicLink() {
  devMagicLink = null;
}
