// Local trigger word lists, mirrored from the empco-check-api Pre-Filter.
// Run offline against the page DOM so we only call the backend for sentences
// that actually contain a candidate env-claim. Saves cost and protects privacy.

export const TRIGGERS_DE: string[] = [
  "klimaneutral", "klima-neutral", "co2-neutral", "co²-neutral", "kohlenstoffneutral",
  "klimapositiv", "co2-positiv",
  "klimafreundlich", "klimaschonend",
  "umweltfreundlich", "umweltschonend",
  "ökologisch", "oekologisch", "eco-friendly",
  "öko ", "oeko ",
  "nachhaltig", "nachhaltigkeit",
  "grün ", "gruen ",
  "biologisch abbaubar", "biodegradabel", "biodegradable",
  "energieeffizient", "klimaeffizient",
  "recycelbar", "recyclebar", "recyclingfähig",
  "klimaneutralisiert", "co2-kompensiert", "co2-ausgleich",
  "plastikfrei", "klimaschutz-projekt", "klimaschutzprojekt",
];

export const TRIGGERS_EN: string[] = [
  "climate-neutral", "climate neutral", "carbon-neutral", "carbon neutral",
  "climate-positive", "climate positive",
  "eco-friendly", "ecofriendly", "environmentally friendly", "environmentally-friendly",
  "green ", "sustainable",
  "biodegradable",
  "natural ", "all-natural",
  "recyclable",
  "energy efficient",
];

export function matchTriggers(text: string, language: "de" | "en"): string[] {
  const list = language === "en" ? TRIGGERS_EN : TRIGGERS_DE;
  const lower = text.toLowerCase();
  return list.filter((w) => lower.includes(w.toLowerCase()));
}

export function hasTrigger(text: string, language: "de" | "en"): boolean {
  return matchTriggers(text, language).length > 0;
}
