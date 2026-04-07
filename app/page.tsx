'use client';

import { useState, useEffect } from 'react';
import ZohoCredentialsForm from '@/components/zoho-credentials-form';
import InvoiceForm from '@/components/invoice-form';
import { 
  getCredentials, 
  getTokens, 
  saveTokens, 
  isTokenValid,
  clearCredentials,
  type ZohoCredentials 
} from '@/lib/zoho-storage';
import { Invoice } from '@/lib/types';

export default function Home() {
  const [hasCredentials, setHasCredentials] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [credentials, setCredentials] = useState<ZohoCredentials | null>(null);

  useEffect(() => {
    // Check if we have credentials
    const stored = getCredentials();
    setCredentials(stored);
    setHasCredentials(!!stored);

    // Check if we have valid tokens
    const tokens = getTokens();
    setIsAuthenticated(isTokenValid(tokens));

    // Check for OAuth callback code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      alert('Authentication error: ' + error);
      window.history.replaceState({}, '', '/');
    } else if (code && stored) {
      // Exchange code for tokens
      exchangeCodeForTokens(code, stored);
    }

    setIsLoading(false);
  }, []);

  const exchangeCodeForTokens = async (code: string, creds: ZohoCredentials) => {
    try {
      const response = await fetch('/api/zoho/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          clientId: creds.clientId,
          clientSecret: creds.clientSecret,
          redirectUrl: creds.redirectUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get tokens');
      }

      // Save tokens
      saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + (data.expiresIn * 1000),
      });

      setIsAuthenticated(true);
      
      // Clean up URL
      window.history.replaceState({}, '', '/');
    } catch (error) {
      alert('Failed to authenticate: ' + (error instanceof Error ? error.message : 'Unknown error'));
      window.history.replaceState({}, '', '/');
    }
  };

  const handleCredentialsSaved = () => {
    const stored = getCredentials();
    setCredentials(stored);
    setHasCredentials(true);
  };

  const handleAuthenticate = () => {
    if (!credentials) return;

    // Redirect to Zoho OAuth authorization
    const scopes = 'ZohoBooks.fullaccess.all';
    const authUrl = `https://accounts.zoho.com/oauth/v2/auth?scope=${scopes}&client_id=${credentials.clientId}&response_type=code&redirect_uri=${encodeURIComponent(credentials.redirectUrl)}&access_type=offline`;
    
    window.location.href = authUrl;
  };

  const handleInvoiceSubmit = async (invoice: Invoice, tailorjetData: any) => {
    const tokens = getTokens();
    if (!tokens || !credentials?.organizationId || !credentials?.tailorjetToken) {
      alert('Missing authentication, organization ID, or TailorJet token');
      return;
    }

    try {
      // Step 1: Create job order in TailorJet
      const jobOrderResponse = await fetch('/api/tailorjet/job-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobOrder: tailorjetData,
          bearerToken: credentials.tailorjetToken,
        }),
      });

      const jobOrderData = await jobOrderResponse.json();

      if (!jobOrderResponse.ok) {
        throw new Error(jobOrderData.error || 'Failed to create job order in TailorJet');
      }

      console.log('TailorJet job order created:', jobOrderData.jobOrder);
      const orderNumber = jobOrderData.orderNumber;

      // Step 2: Find or create customer in Zoho
      const customerResponse = await fetch('/api/zoho/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: invoice.customerName,
          customerEmail: invoice.customerEmail,
          accessToken: tokens.accessToken,
          organizationId: credentials.organizationId,
        }),
      });

      const customerData = await customerResponse.json();

      if (!customerResponse.ok) {
        throw new Error(customerData.error || 'Failed to find or create customer');
      }

      console.log(`Customer ${customerData.existing ? 'found' : 'created'}:`, customerData.customer);

      // Step 3: Create invoice in Zoho Books with order number from TailorJet
      const invoiceWithOrderNumber = {
        ...invoice,
        invoiceNumber: orderNumber, // Use TailorJet order number
      };

      const invoiceResponse = await fetch('/api/zoho/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice: invoiceWithOrderNumber,
          customerId: customerData.customerId,
          accessToken: tokens.accessToken,
          organizationId: credentials.organizationId,
        }),
      });

      const invoiceData = await invoiceResponse.json();

      if (!invoiceResponse.ok) {
        throw new Error(invoiceData.error || 'Failed to create invoice');
      }

      alert(`Success! Job Order ${orderNumber} created in TailorJet and invoice created in Zoho Books!`);
      console.log('Created invoice:', invoiceData.invoice);
    } catch (error) {
      throw error;
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear all credentials and start over?')) {
      clearCredentials();
      setHasCredentials(false);
      setIsAuthenticated(false);
      setCredentials(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Zoho Books Integration</h1>
          {hasCredentials && (
            <button
              onClick={handleReset}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Reset Credentials
            </button>
          )}
        </div>
      </header>

      <main className="py-10">
        {!hasCredentials ? (
          <ZohoCredentialsForm onCredentialsSaved={handleCredentialsSaved} />
        ) : !isAuthenticated ? (
          <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Authenticate with Zoho Books</h2>
              <p className="mb-6 text-gray-600">
                Click the button below to connect your Zoho Books account. You will be redirected to Zoho to authorize access.
              </p>
              <button
                onClick={handleAuthenticate}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
              >
                Connect to Zoho Books
              </button>
            </div>
          </div>
        ) : (
          <InvoiceForm 
            onSubmit={handleInvoiceSubmit} 
            bearerToken={credentials?.tailorjetToken || ''} 
          />
        )}
      </main>
    </div>
  );
}
