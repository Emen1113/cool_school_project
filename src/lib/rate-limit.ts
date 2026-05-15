const voteTimestamps = new Map<string, number[]>();

export function checkVoteRateLimit(
  userId: string,
  limit = 30,
  windowMs = 60_000
): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const timestamps = (voteTimestamps.get(userId) ?? []).filter(
    (t) => now - t < windowMs
  );

  if (timestamps.length >= limit) {
    const oldest = timestamps[0]!;
    return { allowed: false, retryAfterMs: windowMs - (now - oldest) };
  }

  timestamps.push(now);
  voteTimestamps.set(userId, timestamps);
  return { allowed: true };
}

export function checkVoteCooldown(
  userId: string,
  cooldownMs = 1500
): { allowed: boolean; retryAfterMs?: number } {
  const key = `cooldown:${userId}`;
  const last = voteTimestamps.get(key)?.[0];
  const now = Date.now();

  if (last && now - last < cooldownMs) {
    return { allowed: false, retryAfterMs: cooldownMs - (now - last) };
  }

  voteTimestamps.set(key, [now]);
  return { allowed: true };
}
