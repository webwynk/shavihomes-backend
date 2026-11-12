let warnedFallback = false;

/**
 * Resolve the JWT signing/verification secret from environment variables.
 * Fails fast in production when JWT_SECRET is not configured.
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.trim()) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is required in production");
  }

  if (!warnedFallback) {
    warnedFallback = true;
    console.warn("WARNING: JWT_SECRET is not set; using insecure development fallback.");
  }
  return "default_shavi_secret";
}

module.exports = { getJwtSecret };
