export interface TailorJetCredentials {
  apiUrl: string;
  bearerToken: string;
}

const STORAGE_KEY = 'tailorjet_credentials';

export function saveTailorJetCredentials(credentials: TailorJetCredentials): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
  }
}

export function getTailorJetCredentials(): TailorJetCredentials | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }
  return null;
}

export function clearTailorJetCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
