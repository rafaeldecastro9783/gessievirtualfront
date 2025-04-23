export function saveAccessToken(token: string) {
  localStorage.setItem("access_token", token);
}

export function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function getPayload(): any | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64);
    return JSON.parse(payloadJson);
  } catch (error) {
    console.error("Erro ao decodificar payload do token:", error);
    return null;
  }
}
