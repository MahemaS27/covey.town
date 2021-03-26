import formatTimestamp from './MiscUtils';
describe('formatTimestamp', () => {
  it('formats an PM date', () => {
    expect(formatTimestamp(1616811720000)).toBe('3/26/2021 10:22 PM');
  });
  it('formats a AM date', () => {
    expect(formatTimestamp(1616749320000)).toBe('3/26/2021 5:02 AM');
  });
  it('formats noon date', () => {
    expect(formatTimestamp(1616774400000)).toBe('3/26/2021 12:00 PM');
  });
  it('formats midnight date', () => {
    expect(formatTimestamp(1616731200000)).toBe('3/26/2021 12:00 AM');
  });
});
