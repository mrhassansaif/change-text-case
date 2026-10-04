export function cleanWhitespace(text) {
  return text
    .replace(/[^\S\r\n]+/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function removeLineBreaks(text) {
  return text
    .replace(/\r\n|\r|\n/g, ' ')
    .replace(/[^\S\r\n]+/g, ' ')
    .trim();
}

export function trimSpaces(text) {
  return text
    .split(/\r\n|\r|\n/)
    .map((line) => line.replace(/[^\S\r\n]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+|\n+$/g, '');
}

export function sortLines(text) {
  const lines = text.split(/\r\n|\r|\n/);
  const nonEmpty = lines.filter((line) => line.trim() !== '');
  const sorted = [...nonEmpty].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }),
  );
  return sorted.join('\n');
}

export function removeDuplicateLines(text) {
  const lines = text.split(/\r\n|\r|\n/);
  const seen = new Set();
  const result = [];

  for (const line of lines) {
    const key = line.trim();
    if (key === '') {
      if (result.length === 0 || result[result.length - 1] !== '') {
        result.push('');
      }
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(line);
  }

  while (result.length > 0 && result[result.length - 1] === '') {
    result.pop();
  }

  return result.join('\n');
}

export function reverseLines(text) {
  const lines = text.split(/\r\n|\r|\n/);
  return [...lines].reverse().join('\n');
}

export const QUICK_ACTIONS = [
  { id: 'clean-whitespace', label: 'Clean whitespace', transform: cleanWhitespace },
  { id: 'remove-line-breaks', label: 'Remove line breaks', transform: removeLineBreaks },
  { id: 'trim-spaces', label: 'Trim spaces', transform: trimSpaces },
  { id: 'sort-lines', label: 'Sort lines', transform: sortLines },
  { id: 'remove-duplicates', label: 'Remove duplicate lines', transform: removeDuplicateLines },
  { id: 'reverse-lines', label: 'Reverse lines', transform: reverseLines },
];
