'use client';

import { useState, useEffect } from 'react';
import { saveCredentials, getCredentials, type ZohoCredentials } from '@/lib/zoho-storage';

interface ZohoCredentialsFormProps {
  onCredentialsSaved: () => void;
}

export default function ZohoCredentialsForm({ onCredentialsSaved }: ZohoCredentialsFormProps) {
  const [credentials, setCredentials] = useState<ZohoCredentials>({
    clientId: '',
    clientSecret: '',
    redirectUrl: '',
    organizationId: '',
    tailorjetToken: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = getCredentials();
    if (stored) {
      setCredentials(stored);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      saveCredentials(credentials);
      alert('Credentials saved successfully!');
      onCredentialsSaved();
    } catch (error) {
      alert('Error saving credentials: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Zoho Books Configuration</h1>
      <p className="mb-6 text-gray-600">
        Enter your Zoho Books API credentials to get started. You can obtain these from your Zoho Developer Console.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium mb-2 text-gray-900">
            Client ID *
          </label>
          <input
            type="text"
            id="clientId"
            name="clientId"
            value={credentials.clientId}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="1000.XXXXXXXXXX"
          />
        </div>

        <div>
          <label htmlFor="clientSecret" className="block text-sm font-medium mb-2 text-gray-900">
            Client Secret *
          </label>
          <input
            type="text"
            id="clientSecret"
            name="clientSecret"
            value={credentials.clientSecret}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="Your client secret"
          />
        </div>

        <div>
          <label htmlFor="redirectUrl" className="block text-sm font-medium mb-2 text-gray-900">
            Redirect URL *
          </label>
          <input
            type="url"
            id="redirectUrl"
            name="redirectUrl"
            value={credentials.redirectUrl}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="https://your-app.vercel.app/api/zoho/callback"
          />
          <p className="text-sm text-gray-500 mt-1">
            This should match the redirect URI configured in your Zoho app
          </p>
        </div>

        <div>
          <label htmlFor="organizationId" className="block text-sm font-medium mb-2 text-gray-900">
            Organization ID *
          </label>
          <input
            type="text"
            id="organizationId"
            name="organizationId"
            value={credentials.organizationId}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="Your organization ID"
          />
        </div>

        <div>
          <label htmlFor="tailorjetToken" className="block text-sm font-medium mb-2 text-gray-900">
            TailorJet Bearer Token *
          </label>
          <input
            type="text"
            id="tailorjetToken"
            name="tailorjetToken"
            value={credentials.tailorjetToken}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="eyJ0eXAiOiJKV1QiLCJhbGciOi..."
          />
          <p className="text-sm text-gray-500 mt-1">
            Bearer token for TailorJet API authentication
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save Credentials & Continue'}
        </button>
      </form>
    </div>
  );
}
