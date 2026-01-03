import crypto from "crypto";

const KEY_B64 = process.env.TF_ENC_KEY_BASE64;

function getKey() {
  if (!KEY_B64) throw new Error("Missing TF_ENC_KEY_BASE64");
  const key = Buffer.from(KEY_B64, "base64");
  if (key.length !== 32) {
    throw new Error("TF_ENC_KEY_BASE64 must be 32 bytes (base64).");
  }
  return key;
}

export function encryptSecret(plain) {
  if (!plain) return null;
  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptSecret(payload) {
  if (!payload) return null;
  const raw = Buffer.from(payload, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const data = raw.subarray(28);
  const key = getKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
