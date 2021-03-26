import formatTimestamp from './MiscUtils';
describe('formatTimestamp', () => {
  it('formats an PM date', () => {
    expect(formatTimestamp(Date.parse('04 Dec 2020 22:12:00 EST'))).toBe('12/4/2020 10:12 PM');
  });
  it('formats a AM date', () => {
    expect(formatTimestamp(Date.parse('04 Dec 2020 3:12:00 EST'))).toBe('12/4/2020 3:12 AM');
  });
  it('formats noon date', () => {
    expect(formatTimestamp(Date.parse('04 Dec 2020 12:00:00 EST'))).toBe('12/4/2020 12:00 PM');
  });
  it('formats midnight date', () => {
    expect(formatTimestamp(Date.parse('04 Dec 2020 00:00:00 EST'))).toBe('12/4/2020 12:00 AM');
  });
});
