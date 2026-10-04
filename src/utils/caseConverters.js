const TITLE_SMALL_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'but',
  'or',
  'for',
  'nor',
  'on',
  'at',
  'to',
  'by',
  'of',
  'in',
  'with',
  'as',
  'via',
  'vs',
  'vs.',
  'from',
  'into',
  'onto',
  'per',
]);

/**
 * Tokenize text into word-like segments for developer case formats.
 * Normalizes camelCase, PascalCase, snake_case, kebab-case, and spaces.
 */
export function tokenize(text) {
  if (!text) return [];

  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_\-./\\]+/g, ' ')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function toUpperCase(text) {
  return text.toUpperCase();
}

export function toLowerCase(text) {
  return text.toLowerCase();
}

/** Capitalize the first letter of every word (preserves spacing). */
export function toCapitalizedCase(text) {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Title case with small-word exceptions (not first/last word).
 * Example: "the quick brown fox jumps over the lazy dog"
 * → "The Quick Brown Fox Jumps Over the Lazy Dog"
 */
export function toTitleCase(text) {
  const words = text.toLowerCase().split(/(\s+)/);

  const wordIndices = words
    .map((part, index) => (/\S/.test(part) ? index : -1))
    .filter((index) => index !== -1);

  const firstIndex = wordIndices[0];
  const lastIndex = wordIndices[wordIndices.length - 1];

  return words
    .map((part, index) => {
      if (!/\S/.test(part)) return part;

      const lower = part.toLowerCase();
      const isEdge = index === firstIndex || index === lastIndex;

      if (!isEdge && TITLE_SMALL_WORDS.has(lower)) {
        return lower;
      }

      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

/**
 * Sentence case: lowercase everything, then capitalize starts of sentences.
 * Example: "HELLO WORLD. THIS IS A TEST!" → "Hello world. This is a test!"
 */
export function toSentenceCase(text) {
  const lower = text.toLowerCase();
  return lower.replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, (match) =>
    match.toUpperCase(),
  );
}

export function toCamelCase(text) {
  const words = tokenize(text);
  if (words.length === 0) return '';

  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

export function toPascalCase(text) {
  return tokenize(text)
    .map((word) => {
      const lower = word.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

export function toSnakeCase(text) {
  return tokenize(text)
    .map((word) => word.toLowerCase())
    .join('_');
}

export function toKebabCase(text) {
  return tokenize(text)
    .map((word) => word.toLowerCase())
    .join('-');
}

export function toConstantCase(text) {
  return tokenize(text)
    .map((word) => word.toUpperCase())
    .join('_');
}

export function toAlternatingCase(text) {
  let upper = true;
  return text
    .split('')
    .map((char) => {
      if (!/[a-zA-Z]/.test(char)) return char;
      const next = upper ? char.toUpperCase() : char.toLowerCase();
      upper = !upper;
      return next;
    })
    .join('');
}

export function toInverseCase(text) {
  return text
    .split('')
    .map((char) => {
      if (char === char.toUpperCase() && char !== char.toLowerCase()) {
        return char.toLowerCase();
      }
      if (char === char.toLowerCase() && char !== char.toUpperCase()) {
        return char.toUpperCase();
      }
      return char;
    })
    .join('');
}

export function countWords(text) {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function countLines(text) {
  if (text === '') return 0;
  return text.split(/\r\n|\r|\n/).length;
}

export const SAMPLE_TEXT =
  'The quick brown fox jumps over the lazy dog. Transform text instantly with ReactCase Wizard!';

export const CASE_GROUPS = [
  {
    id: 'writing',
    label: 'Writing',
    actions: [
      { id: 'uppercase', label: 'UPPERCASE', transform: toUpperCase },
      { id: 'lowercase', label: 'lowercase', transform: toLowerCase },
      { id: 'sentence', label: 'Sentence case', transform: toSentenceCase },
      { id: 'title', label: 'Title Case', transform: toTitleCase },
      { id: 'capitalized', label: 'Capitalized Case', transform: toCapitalizedCase },
    ],
  },
  {
    id: 'developer',
    label: 'Developer',
    actions: [
      { id: 'camel', label: 'camelCase', transform: toCamelCase },
      { id: 'pascal', label: 'PascalCase', transform: toPascalCase },
      { id: 'snake', label: 'snake_case', transform: toSnakeCase },
      { id: 'kebab', label: 'kebab-case', transform: toKebabCase },
      { id: 'constant', label: 'CONSTANT_CASE', transform: toConstantCase },
    ],
  },
  {
    id: 'fun',
    label: 'Fun',
    actions: [
      { id: 'alternating', label: 'aLtErNaTiNg', transform: toAlternatingCase },
      { id: 'inverse', label: 'InVeRsE cAsE', transform: toInverseCase },
    ],
  },
];
