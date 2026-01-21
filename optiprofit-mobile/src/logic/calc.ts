export type CalcInput = {
  ek: number | null;
  vk: number | null;
  vk_normal?: number | null;
  wkz_total?: number | null;
  menge?: number | null;
};

export type CalcResult = {
  db: number | null;
  marge_pct: number | null;
  gewinn_100: number | null;
  wkz_einheit: number | null;
  db_netto: number | null;
  db_norm: number | null;
  db_akt: number | null;
  db_diff: number | null;
  break_even_menge: number | null;
};

export function calculate(input: CalcInput): CalcResult {
  const ek = input.ek ?? null;
  const vk = input.vk ?? null;
  const vkNormal = input.vk_normal ?? null;
  const wkzTotal = input.wkz_total ?? null;
  const menge = input.menge ?? null;

  const db = ek != null && vk != null ? vk - ek : null;
  const margePct = db != null && vk != null && vk > 0 ? (db / vk) * 100 : null;
  const gewinn100 = db != null ? db * 100 : null;

  const wkzEinheit =
    wkzTotal != null && menge != null && menge > 0 ? wkzTotal / menge : null;
  const dbNetto = db != null && wkzEinheit != null ? db + wkzEinheit : null;

  const dbNorm = vkNormal != null && ek != null ? vkNormal - ek : null;
  const dbAkt = db;
  const dbDiff = dbNorm != null && dbAkt != null ? dbNorm - dbAkt : null;

  const breakEvenMenge =
    wkzTotal != null && dbDiff != null && dbDiff > 0
      ? Math.ceil(wkzTotal / dbDiff)
      : null;

  return {
    db,
    marge_pct: margePct,
    gewinn_100: gewinn100,
    wkz_einheit: wkzEinheit,
    db_netto: dbNetto,
    db_norm: dbNorm,
    db_akt: dbAkt,
    db_diff: dbDiff,
    break_even_menge: breakEvenMenge,
  };
}
