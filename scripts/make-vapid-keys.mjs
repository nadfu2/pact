// Prints a fresh pair of Web Push (VAPID) keys and a random secret. Run: node scripts/make-vapid-keys.mjs
import { webcrypto as crypto } from 'node:crypto';
const b64u = (b) => Buffer.from(b).toString('base64url');
const k = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const pub = new Uint8Array(await crypto.subtle.exportKey('raw', k.publicKey));
const jwk = await crypto.subtle.exportKey('jwk', k.privateKey);
console.log('VAPID_PUBLIC_KEY  =', b64u(pub));
console.log('VAPID_PRIVATE_KEY =', jwk.d);
console.log('PUSH_SECRET       =', b64u(crypto.getRandomValues(new Uint8Array(32))));
