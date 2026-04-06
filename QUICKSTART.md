# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Set Up Zoho API Application (3 minutes)

1. Go to [Zoho API Console](https://api-console.zoho.com/)
2. Click "Add Client" → "Server-based Applications"
3. Fill in the details:
   - **Client Name**: Any name (e.g., "My Invoice App")
   - **Homepage URL**: `http://localhost:3000` (for local testing)
   - **Authorized Redirect URIs**: `http://localhost:3000/api/zoho/callback`
4. Click "Create"
5. **Save these values**:
   - ✅ Client ID
   - ✅ Client Secret

6. Get your Organization ID:
   - Go to [Zoho Books](https://books.zoho.com)
   - Settings → Organization → Copy the Organization ID

### Step 2: Run the Application Locally (1 minute)

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 3: Configure & Connect (1 minute)

1. **Enter your Zoho credentials**:
   - Client ID (from Step 1)
   - Client Secret (from Step 1)
   - Redirect URL: `http://localhost:3000/api/zoho/callback`
   - Organization ID (from Step 1)

2. Click **"Save Credentials & Continue"**

3. Click **"Connect to Zoho Books"**

4. Authorize the application in Zoho

### Step 4: Create Your First Invoice

1. Fill in customer information
2. Add line items:
   - Item name
   - Quantity
   - Price
   - Tax (optional)
3. Click **"Add Item"**
4. Review the invoice
5. Click **"Send to Zoho Books"**

Done! Check your Zoho Books account to see the invoice.

## 📦 Deploy to Production

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

After deployment:
1. Get your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Update Zoho API Console redirect URI to: `https://your-app.vercel.app/api/zoho/callback`
3. In your app, update credentials with the new redirect URL

## 🎯 Features Overview

- ✅ Secure OAuth2 authentication
- ✅ Local credential storage
- ✅ Multi-item invoices
- ✅ Automatic calculations (subtotal, tax, total)
- ✅ Direct push to Zoho Books
- ✅ Mobile-responsive design

## 📝 Invoice Fields

### Customer Information
- Customer Name (required)
- Customer Email (optional)

### Invoice Details
- Invoice Number (auto-generated if empty)
- Invoice Date (required)
- Due Date (required)

### Line Items
- Item Name (required)
- Description (optional)
- Quantity (required)
- Rate/Price (required)
- Tax Percentage (optional)

### Additional
- Notes (optional)

## ⚙️ Technical Details

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: Zoho Books API v3
- **Authentication**: OAuth 2.0
- **Storage**: Browser localStorage

## 🔒 Security

- All credentials stored client-side only
- OAuth2 authorization flow
- Secure token management
- No server-side credential storage

## 💡 Tips

1. **Testing**: Use localhost first before deploying
2. **Organization ID**: Required for creating invoices
3. **Token Expiry**: Tokens auto-refresh when needed
4. **Multiple Organizations**: Store different credentials per browser
5. **Reset**: Use "Reset Credentials" to start fresh

## 🐛 Common Issues

### "redirect_uri_mismatch"
→ Redirect URL must match exactly in Zoho Console

### "Invalid organization_id"
→ Get Organization ID from Zoho Books Settings

### "Unauthorized"
→ Clear credentials and re-authenticate

### Invoice not appearing in Zoho Books
→ Check Organization ID and account permissions

## 📚 Next Steps

- See [README.md](./README.md) for detailed documentation
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guide
- Check [Zoho Books API Docs](https://www.zoho.com/books/api/v3/) for API details

## 🤝 Need Help?

- Check the browser console for errors
- Verify all credentials are correct
- Ensure Zoho Books account has proper permissions
- Review Zoho API Console for usage/errors
