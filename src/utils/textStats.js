export function countWords(text) {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function countLines(text) {
  if (text === '') return 0;
  return text.split(/\r\n|\r|\n/).length;
}

export function countCharacters(text) {
  return text.length;
}

export function countCharactersNoSpaces(text) {
  return text.replace(/\s/g, '').length;
}

/** Lightweight sentence count based on . ! ? terminators. */
export function countSentences(text) {
  if (!text.trim()) return 0;

  const matches = text.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g);
  if (!matches) return 0;

  return matches.filter((part) => part.trim().length > 0).length;
}

export function getTextStats(text) {
  return {
    words: countWords(text),
    characters: countCharacters(text),
    charactersNoSpaces: countCharactersNoSpaces(text),
    lines: countLines(text),
    sentences: countSentences(text),
  };
}
