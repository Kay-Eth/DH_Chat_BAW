import { encodeMessage, decodeMessage } from './encryption';
import { caesarEncrypt, caesarDecrypt } from './encryption';


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

describe('Caesar Cipher', () => {
  describe('caesarEncrypt', () => {
    it('should encrypt a message with a positive secret key', () => {
      const message = 'Hello World!';
      const secret = BigInt(3);
      const encryptedMessage = caesarEncrypt(message, secret);
      expect(encryptedMessage).toBe('Khoor Zruog!');
    });

    it('should encrypt a message with a negative secret key', () => {
      const message = 'Hello World!';
      const secret = BigInt(-3);
      const encryptedMessage = caesarEncrypt(message, secret);
      expect(encryptedMessage).toBe('Ebiil Tloia!');
    });

    it('should encrypt a message with a secret key greater than 26', () => {
      const message = 'Hello World!';
      const secret = BigInt(30);
      const encryptedMessage = caesarEncrypt(message, secret);
      expect(encryptedMessage).toBe('Lipps Asvph!');
    });

    it('should encrypt a message with a secret key equal to 26', () => {
      const message = 'Hello World!';
      const secret = BigInt(26);
      const encryptedMessage = caesarEncrypt(message, secret);
      expect(encryptedMessage).toBe('Hello World!');
    });

    it('should encrypt a message with Polish characters', () => {
      const message = 'Polskie znaki: ąćęłńóśźż';
      const secret = BigInt(5);
      const encryptedMessage = caesarEncrypt(message, secret);
      expect(encryptedMessage).toBe('Utqxpnj esfpn: ĊČĞŇŉóŠćĉ');
    });
  });

  describe('caesarDecrypt', () => {
    it('should decrypt an encrypted message with a positive secret key', () => {
      const encryptedMessage = 'Khoor Zruog!';
      const secret = BigInt(3);
      const decryptedMessage = caesarDecrypt(encryptedMessage, secret);
      expect(decryptedMessage).toBe('Hello World!');
    });

    it('should decrypt an encrypted message with a negative secret key', () => {
      const encryptedMessage = 'Ebiil Tloia!';
      const secret = BigInt(-3);
      const decryptedMessage = caesarDecrypt(encryptedMessage, secret);
      expect(decryptedMessage).toBe('Hello World!');
    });

    it('should decrypt an encrypted message with a secret key greater than 26', () => {
      const encryptedMessage = 'Lipps Asvph!';
      const secret = BigInt(30);
      const decryptedMessage = caesarDecrypt(encryptedMessage, secret);
      expect(decryptedMessage).toBe('Hello World!');
    });

    it('should decrypt an encrypted message with a secret key equal to 26', () => {
      const encryptedMessage = 'Hello World!';
      const secret = BigInt(26);
      const decryptedMessage = caesarDecrypt(encryptedMessage, secret);
      expect(decryptedMessage).toBe('Hello World!');
    });

    it('should decrypt an encrypted message with Polish characters', () => {
      const encryptedMessage = 'Utqxpnj esfpn: ĊČĞŇŉóŠćĉ';
      const secret = BigInt(5);
      const decryptedMessage = caesarDecrypt(encryptedMessage, secret);
      expect(decryptedMessage).toBe('Polskie znaki: ąćęłńóśźż');
    });
  });
});