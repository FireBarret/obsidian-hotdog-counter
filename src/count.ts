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

export interface CountOptions {
  caseSensitive: boolean;
  /** Also count hotdogs spelled out by the letters of nearby words */
  hidden: boolean;
  /** How many characters a hidden hotdog may stretch over (41 is "how many times have you done paragliding") */
  window: number;
}

/** One hotdog: the [from, to) character spans to highlight. */
export type Match = Array<[number, number]>;

/**
 * Finds hotdogs spelled out by the letters of nearby words, over text[from, to).
 * Two ways count: any case within `window` chars, or capitals only at any distance
 * ("HOw many Times have you DOne paraGliding?"). A match resets both so nothing counts twice.
 * Each match highlights just its six letters.
 */
function scanHidden(text: string, from: number, to: number, opts: CountOptions, out: Match[]): void {
  // paths[k] = positions of the latest in-order run of the first k letters
  const paths: Array<number[] | null> = [null, null, null, null, null, null, null];
  let caps: number[] = [];

  for (let i = from; i < to; i++) {
    const code = text.charCodeAt(i);
    const upper = code >= 65 && code <= 90;
    if (!upper && !(code >= 97 && code <= 122)) continue;
    const ch = String.fromCharCode(code | 32);

    let found: number[] | null = null;

    if (upper) {
      if (ch === TARGET[caps.length]) {
        caps.push(i);
        if (caps.length === 6) found = caps;
      } else {
        caps = ch === 'h' ? [i] : [];
      }
    }

    if (opts.hidden) {
      for (let k = 6; k >= 1; k--) {
        if (ch !== TARGET[k - 1]) continue;
        const prev = k === 1 ? [] : paths[k - 1];
        if (prev) paths[k] = [...prev, i];
      }
      const path = paths[6];
      if (!found && path && i - (path[0] ?? i) < opts.window) found = path;
    }

    if (found) {
      out.push(found.map((p): [number, number] => [p, p + 1]));
      caps = [];
      paths.fill(null);
    }
  }
}

export function findHotdogs(text: string, opts: CountOptions): Match[] {
  const pattern = opts.caseSensitive ? CASE_SENSITIVE : CASE_INSENSITIVE;
  pattern.lastIndex = 0;

  const matches: Match[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  // Fuzzy matches count once; the hidden scan covers the text in between
  // so a plain "HOTDOG" is never counted twice.
  while ((m = pattern.exec(text)) !== null) {
    scanHidden(text, last, m.index, opts, matches);
    matches.push([[m.index, m.index + m[0].length]]);
    last = m.index + m[0].length;
  }
  scanHidden(text, last, text.length, opts, matches);
  return matches;
}

export function countHotdogs(text: string, opts: CountOptions): number {
  return findHotdogs(text, opts).length;
}
