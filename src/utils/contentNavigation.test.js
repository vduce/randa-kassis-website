import { getContentNeighbors } from './contentNavigation';

test('navigation follows existing records across deleted IDs', () => {
  const entries = [{ id: 5 }, { id: 9 }, { id: 20 }];
  expect(getContentNeighbors(entries, '9')).toEqual({ previous: entries[0], next: entries[2] });
  expect(getContentNeighbors(entries, 5).previous).toBeNull();
  expect(getContentNeighbors(entries, 20).next).toBeNull();
  expect(getContentNeighbors(entries, 6)).toEqual({ previous: null, next: null });
});
