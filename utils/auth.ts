import { sha256 } from 'js-sha256';

const SALT_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateSalt(length = 16): string {
  let salt = '';
  for (let i = 0; i < length; i++) {
    salt += SALT_CHARS[Math.floor(Math.random() * SALT_CHARS.length)];
  }
  return salt;
}

export function hashWithSalt(value: string, salt: string): string {
  return sha256(`${salt}:${value}`);
}
