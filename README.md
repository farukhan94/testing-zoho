# Zoho Books Integration App

A Next.js application that allows you to connect to Zoho Books and create invoices directly from a simple web interface.

## Features

- Secure OAuth2 authentication with Zoho Books
- Store Zoho API credentials locally in browser
- Create invoices with multiple line items
- Automatic tax and total calculations
- Push invoices directly to Zoho Books

## Prerequisites

Before you begin, you need to set up a Zoho API application:

1. Go to [Zoho API Console](https://api-console.zoho.com/)
2. Create a new "Server-based Application"
3. Note down your **Client ID** and **Client Secret**
4. Set the **Redirect URI** to match your deployment URL (e.g., `https://your-app.vercel.app/api/zoho/callback`)
5. Get your **Organization ID** from Zoho Books (Settings > Organization > Organization ID)

## Getting Started

### Local Development

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

4. Enter your Zoho API credentials when prompted

### Using the Application

1. **Configure Zoho Credentials**: On first launch, enter your:
   - Client ID
   - Client Secret
   - Redirect URL (use `http://localhost:3000/api/zoho/callback` for local development)
   - Organization ID

2. **Authenticate**: Click "Connect to Zoho Books" to authorize the application

3. **Create Invoices**: Once authenticated, you can:
   - Enter customer information
   - Add multiple line items with quantity, price, and tax
   - Add notes
   - Submit to Zoho Books

## Deploy on Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/zoho-books-integration)

### Manual Deployment

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Deploy:

```bash
vercel
```

3. Follow the prompts to deploy your application

4. **Important**: After deployment, update your Zoho API Console:
   - Go to your Zoho application settings
   - Update the Redirect URI to: `https://your-vercel-url.vercel.app/api/zoho/callback`

## Project Structure

```
├── app/
│   ├── api/
│   │   └── zoho/
│   │       ├── callback/    # OAuth callback handler
│   │       ├── token/       # Token exchange endpoint
│   │       └── invoice/     # Invoice creation endpoint
│   ├── page.tsx             # Main application page
│   └── layout.tsx           # Root layout
├── components/
│   ├── zoho-credentials-form.tsx  # Credentials input form
│   └── invoice-form.tsx           # Invoice creation form
├── lib/
│   ├── zoho-storage.ts      # Local storage utilities
│   └── types.ts             # TypeScript type definitions
└── vercel.json              # Vercel configuration

```

## API Routes

- `GET /api/zoho/callback` - Handles OAuth callback from Zoho
- `POST /api/zoho/token` - Exchanges authorization code for access tokens
- `POST /api/zoho/invoice` - Creates an invoice in Zoho Books

## Technologies Used

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Zoho Books API v3

## Security Notes

- Credentials are stored in browser's localStorage (client-side only)
- API credentials should never be committed to version control
- Tokens are automatically managed and refreshed
- All API calls are proxied through Next.js API routes

## Troubleshooting

### Authentication Issues

- Verify your Client ID and Secret are correct
- Ensure the Redirect URL matches exactly in both Zoho Console and your app
- Check that you have the correct scopes enabled (`ZohoBooks.fullaccess.all`)

### Invoice Creation Issues

- Verify your Organization ID is correct
- Ensure your Zoho Books account has the necessary permissions
- Check the browser console for detailed error messages

## Future Enhancements

This is a proof of concept. Potential improvements include:

- Customer management
- Invoice templates
- Payment tracking
- Reporting dashboard
- Multi-currency support
- Recurring invoices

## License

MIT
