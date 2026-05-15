/** Standard ELO rating calculations (K=32 default). */

export const DEFAULT_ELO = 1000;
export const DEFAULT_K_FACTOR = 32;

export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function calculateNewRatings(
  winnerRating: number,
  loserRating: number,
  kFactor = DEFAULT_K_FACTOR
): { winnerNew: number; loserNew: number; winnerDelta: number; loserDelta: number } {
  const expectedWinner = expectedScore(winnerRating, loserRating);
  const expectedLoser = expectedScore(loserRating, winnerRating);

  const winnerDelta = Math.round(kFactor * (1 - expectedWinner));
  const loserDelta = Math.round(kFactor * (0 - expectedLoser));

  return {
    winnerNew: winnerRating + winnerDelta,
    loserNew: Math.max(100, loserRating + loserDelta),
    winnerDelta,
    loserDelta,
  };
}
