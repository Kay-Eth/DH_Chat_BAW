import { encodeMessage, decodeMessage } from './encryption';

describe('encodeMessage', () => {
  it('should encode a message in Base64', () => {
    const message = 'Hello, world!';
    const encodedMessage = encodeMessage(message);
    expect(encodedMessage).toBe('SGVsbG8sIHdvcmxkIQ==');
  });

  it('should encode an empty message', () => {
    const message = '';
    const encodedMessage = encodeMessage(message);
    expect(encodedMessage).toBe('');
  });
});

describe('decodeMessage', () => {
  it('should decode a message from Base64', () => {
    const base64 = 'SGVsbG8sIHdvcmxkIQ==';
    const decodedMessage = decodeMessage(base64);
    expect(decodedMessage).toBe('Hello, world!');
  });

  it('should decode an empty message', () => {
    const base64 = '';
    const decodedMessage = decodeMessage(base64);
    expect(decodedMessage).toBe('');
  });
});

