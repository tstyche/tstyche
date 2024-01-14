/**
 * @param {string} fixture
 */
export function getFixtureUrl(fixture) {
  return new URL(`../__fixtures__/${fixture}/`, import.meta.url);
}
