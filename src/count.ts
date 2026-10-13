// Fuzzy "hotdog": allows spaces/dots/dashes between letters, o/a swaps,
// extra t's, a stray "w", and a skipped "o" (hotdog, hottodog, ho t dawg, h o t d o g, hawtdog)
const SEP = '[\\s._-]{0,3}';
const FUZZY = `h${SEP}[oa]w?${SEP}t+${SEP}o?${SEP}d${SEP}[oa]w?${SEP}g`;
const CASE_SENSITIVE = new RegExp(FUZZY, 'g');
const CASE_INSENSITIVE = new RegExp(FUZZY, 'gi');

// Capital letters that spell it out, e.g. "HOw many Times have you DOne paraGliding?"
const HIDDEN = 'HOTDOG';

/** Walks capitals in text[from, to), advancing the HOTDOG matcher. Returns [hits, state]. */
function scanCapitals(text: string, from: number, to: number, state: number): [number, number] {
  let hits = 0;
  for (let i = from; i < to; i++) {
    const c = text.charCodeAt(i);
    if (c < 65 || c > 90) continue;
    const ch = text[i];
    if (ch === HIDDEN[state]) {
      if (++state === HIDDEN.length) {
        hits++;
        state = 0;
      }
    } else {
      state = ch === 'H' ? 1 : 0;
    }
  }
  return [hits, state];
}

export function countHotdogs(text: string, caseSensitive: boolean): number {
  const pattern = caseSensitive ? CASE_SENSITIVE : CASE_INSENSITIVE;
  pattern.lastIndex = 0;

  let count = 0;
  let state = 0;
  let last = 0;
  let m: RegExpExecArray | null;
  // Fuzzy matches count once; the capitals scan covers the text in between
  // so a plain "HOTDOG" is never counted twice.
  while ((m = pattern.exec(text)) !== null) {
    count++;
    const [hits, s] = scanCapitals(text, last, m.index, state);
    count += hits;
    state = s;
    last = m.index + m[0].length;
  }
  count += scanCapitals(text, last, text.length, state)[0];
  return count;
}
