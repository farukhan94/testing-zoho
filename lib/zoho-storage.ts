export interface ZohoCredentials {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  organizationId?: string;
  tailorjetToken?: string;
}

export interface ZohoTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const CREDENTIALS_KEY = 'zoho_credentials';
const TOKENS_KEY = 'zoho_tokens';

export const saveCredentials = (credentials: ZohoCredentials): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
  }
};

export const getCredentials = (): ZohoCredentials | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(CREDENTIALS_KEY);
    return stored ? JSON.parse(stored) : null;
  }
  return null;
};

export const saveTokens = (tokens: ZohoTokens): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  }
};

export const getTokens = (): ZohoTokens | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(TOKENS_KEY);
    return stored ? JSON.parse(stored) : null;
  }
  return null;
};

export const clearCredentials = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CREDENTIALS_KEY);
    localStorage.removeItem(TOKENS_KEY);
  }
};

export const isTokenValid = (tokens: ZohoTokens | null): boolean => {
  if (!tokens) return false;
  return Date.now() < tokens.expiresAt;
};
