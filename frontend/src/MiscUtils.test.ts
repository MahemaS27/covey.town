import formatTimestamp from './MiscUtils';
describe('formatTimestamp', () => {
  it('formats an PM date', () => {
    expect(formatTimestamp(1616797320000)).toBe('3/26/2021 10:22 PM');
  });
  it('formats a AM date', () => {
    expect(formatTimestamp(1616734920000)).toBe('3/26/2021 5:02 AM');
  });
  it('formats noon date', () => {
    expect(formatTimestamp(1616760000000)).toBe('3/26/2021 12:00 PM');
  });
  it('formats midnight date', () => {
    expect(formatTimestamp(1616716800000)).toBe('3/26/2021 12:00 AM');
  });
});
