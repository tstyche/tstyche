export function getFixtureUrl(fixture: string): URL {
  return new URL(`../__fixtures__/${fixture}/`, import.meta.url);
}
