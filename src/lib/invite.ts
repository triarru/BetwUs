const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInviteCode(length = 6) {
  let code = "";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  for (const byte of bytes) {
    code += ALPHABET[byte % ALPHABET.length];
  }
  return code;
}

export function inviteExpiry(days = 7) {
  return new Date(Date.now() + days * 86_400_000);
}
