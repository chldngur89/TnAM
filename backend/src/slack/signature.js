/**
 * Slack request signature verification (v0).
 * https://api.slack.com/authentication/verifying-requests-from-slack
 */
import crypto from 'crypto';

/**
 * @param {string} signingSecret - SLACK_SIGNING_SECRET
 * @param {string} body - Raw request body (string)
 * @param {string} signature - X-Slack-Signature header (e.g. "v0=hexdigest")
 * @returns {boolean}
 */
export function verifySlackSignature(signingSecret, body, signature) {
  if (!signingSecret || !signature || !body) return false;
  const [version, expectedHash] = signature.split('=');
  if (version !== 'v0' || !expectedHash) return false;

  const base = `v0:${body}`;
  const hmac = crypto.createHmac('sha256', signingSecret);
  hmac.update(base);
  const computed = 'v0=' + hmac.digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(computed, 'utf8'));
}
