/**
 * Sort elements in set in alphabetical order and eliminate empty values.
 * @param elements list of elements
 */
export function sortSet(elements: Set<string>): string[] {
  const sortedElements = [...elements].sort((a, b) => a.localeCompare(b));
  // remove empty string
  if (sortedElements.length && !sortedElements[0]) {
    sortedElements.shift();
  }
  return sortedElements;
}

export function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}
