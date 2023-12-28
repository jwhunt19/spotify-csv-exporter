// generate code verifier using crypto.getRandomValues
export function generateCodeVerifier() {
  // Generate a secure random string using the browser crypto functions
  const generateRandomString = (length) => {
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
  };

  const codeVerifier = generateRandomString(64);
  return codeVerifier;
}

// generate code challenge from code verifier
export async function generateCodeChallenge(codeVerifier) {
  // Generate a SHA-256 hash of the input string using SubtleCrypto interface.
  const sha256 = async (plain) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest("SHA-256", data);
  };

  // Base64-urlencodes the input string
  const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };

  // Generate code challenge from code verifier according to PKCE spec.
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  return codeChallenge;
}
