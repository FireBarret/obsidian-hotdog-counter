const SEP = '[\\s._-]{0,3}';

// Fuzzy "hotdog": allows spaces/dots/dashes between letters, o/a swaps,
// extra t's, a stray "w", and a skipped "o" (hotdog, hottodog, ho t dawg, h o t d o g, hawtdog)
const HOTDOG = `h${SEP}[oa]w?${SEP}t+${SEP}o?${SEP}d${SEP}[oa]w?${SEP}g`;

// Other terms: letters may repeat and be spaced out ("g l i z z y", "weeenie")
const OTHER_TERMS = [
  'glizzy', 'glizzie', 'wiener', 'weiner', 'weenie', 'frankfurter', 'bratwurst', 'sausage', 'meatsac',
];
const spaced = (word: string) => [...word].map(c => `${c}+`).join(SEP);

const FUZZY = [HOTDOG, ...OTHER_TERMS.map(spaced)].join('|');
const CASE_SENSITIVE = new RegExp(FUZZY, 'g');
const CASE_INSENSITIVE = new RegExp(FUZZY, 'gi');

const TARGET = 'hotdog';
// Hidden hotdogs: h,o,t,d,o,g in order inside a window this wide
// (41 chars is "how many times have you done paragliding")
const WINDOW = 45;

/**
 * Finds hotdogs spelled out by the letters of nearby words, over text[from, to).
 * Two ways count: any case within WINDOW chars, or capitals only at any distance
 * ("HOw many Times have you DOne paraGliding?"). A match resets both so nothing counts twice.
 */
function scanHidden(text: string, from: number, to: number, sloppy: boolean): number {
  // latest[k] = latest start index of an in-order run of the first k letters (-1 = none)
  const latest = [0, -1, -1, -1, -1, -1, -1];
  let caps = 0;
  let hits = 0;

  for (let i = from; i < to; i++) {
    const code = text.charCodeAt(i);
    const upper = code >= 65 && code <= 90;
    if (!upper && !(code >= 97 && code <= 122)) continue;
    const ch = String.fromCharCode(code | 32);

    let done = false;

    if (upper) {
      if (ch === TARGET[caps]) {
        if (++caps === 6) done = true;
      } else {
        caps = ch === 'h' ? 1 : 0;
      }
    }

    if (sloppy) {
      for (let k = 6; k >= 1; k--) {
        if (ch !== TARGET[k - 1]) continue;
        const prev = k === 1 ? i : latest[k - 1] ?? -1;
        if (prev >= 0) latest[k] = prev;
      }
      const start = latest[6] ?? -1;
      if (start >= 0 && i - start < WINDOW) done = true;
    }

    if (done) {
      hits++;
      caps = 0;
      latest.fill(-1, 1);
    }
  }
  return hits;
}

export function countHotdogs(text: string, caseSensitive: boolean, sloppy: boolean): number {
  const pattern = caseSensitive ? CASE_SENSITIVE : CASE_INSENSITIVE;
  pattern.lastIndex = 0;

  let count = 0;
  let last = 0;
  let m: RegExpExecArray | null;
  // Fuzzy matches count once; the hidden scan covers the text in between
  // so a plain "HOTDOG" is never counted twice.
  while ((m = pattern.exec(text)) !== null) {
    count++;
    count += scanHidden(text, last, m.index, sloppy);
    last = m.index + m[0].length;
  }
  return count + scanHidden(text, last, text.length, sloppy);
}
