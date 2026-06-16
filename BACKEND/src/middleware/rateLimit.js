const rateLimitStore = new Map();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 30;
const MAX_PIN_ATTEMPTS = 5;

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const record = rateLimitStore.get(ip) || { count: 0, resetAt: now + WINDOW_MS, pinAttempts: 0 };

  if (now > record.resetAt) {
    record.count = 0;
    record.pinAttempts = 0;
    record.resetAt = now + WINDOW_MS;
  }

  record.count += 1;

  if (record.count > MAX_REQUESTS) {
    return res.status(429).send('END Too many requests. Please try again later.');
  }

  rateLimitStore.set(ip, record);
  req.rateLimitRecord = record;
  next();
}

function trackPinAttempt(phoneNumber) {
  const now = Date.now();
  const key = `pin:${phoneNumber}`;
  const record = rateLimitStore.get(key) || { pinAttempts: 0, lockedUntil: 0 };

  if (now < record.lockedUntil) {
    return { blocked: true, remainingMinutes: Math.ceil((record.lockedUntil - now) / 60000) };
  }

  record.pinAttempts += 1;

  if (record.pinAttempts >= MAX_PIN_ATTEMPTS) {
    record.lockedUntil = now + 30 * 60 * 1000;
    record.pinAttempts = 0;
    rateLimitStore.set(key, record);
    return { blocked: true, remainingMinutes: 30 };
  }

  rateLimitStore.set(key, record);
  return { blocked: false, attemptsRemaining: MAX_PIN_ATTEMPTS - record.pinAttempts };
}

function resetPinAttempts(phoneNumber) {
  rateLimitStore.delete(`pin:${phoneNumber}`);
}

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore) {
    if (now > record.resetAt && !key.startsWith('pin:')) {
      rateLimitStore.delete(key);
    }
    if (key.startsWith('pin:') && record.lockedUntil && now > record.lockedUntil) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);

module.exports = { rateLimit, trackPinAttempt, resetPinAttempts };
