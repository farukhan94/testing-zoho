# Deployment Guide

## Deploying to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Zoho Books integration app"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

3. **Get your deployment URL**:
   - After deployment, you'll get a URL like: `https://your-app-name.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

## Post-Deployment Setup

### 1. Configure Zoho API Console

After deploying, you MUST update your Zoho API application:

1. Go to [Zoho API Console](https://api-console.zoho.com/)
2. Select your application
3. Update the **Redirect URI** to:
   ```
   https://your-actual-vercel-url.vercel.app/api/zoho/callback
   ```
   Replace `your-actual-vercel-url` with your real Vercel URL

4. Save the changes

### 2. First-Time Application Setup

1. Visit your deployed application
2. Enter your Zoho credentials:
   - **Client ID**: From Zoho API Console
   - **Client Secret**: From Zoho API Console
   - **Redirect URL**: `https://your-actual-vercel-url.vercel.app/api/zoho/callback`
   - **Organization ID**: From Zoho Books (Settings > Organization)

3. Click "Save Credentials & Continue"
4. Click "Connect to Zoho Books"
5. Authorize the application in Zoho
6. You'll be redirected back and can start creating invoices

## Environment Setup Checklist

- [ ] Next.js app deployed to Vercel
- [ ] Deployment URL obtained
- [ ] Zoho API Console redirect URI updated
- [ ] Application tested with Zoho credentials
- [ ] OAuth flow working correctly
- [ ] Invoice creation tested

## Testing Your Deployment

1. **Test Credentials Form**:
   - Visit your deployed URL
   - Enter Zoho credentials
   - Verify they're saved in localStorage

2. **Test OAuth Flow**:
   - Click "Connect to Zoho Books"
   - Complete Zoho authorization
   - Verify redirect back to your app
   - Check that you see the invoice form

3. **Test Invoice Creation**:
   - Fill in customer details
   - Add at least one line item
   - Submit the invoice
   - Verify it appears in your Zoho Books account

## Troubleshooting Deployment Issues

### Build Fails

- Check for TypeScript errors: `npm run build`
- Ensure all dependencies are installed: `npm install`
- Check Node.js version compatibility

### OAuth Redirect Issues

- **Error: redirect_uri_mismatch**
  - Verify the redirect URI in Zoho Console matches exactly
  - Check for trailing slashes or protocol mismatches (http vs https)

### Invoice Creation Fails

- **Error: Invalid organization_id**
  - Verify your Organization ID from Zoho Books settings
  - Ensure you're using the correct Zoho account

- **Error: Unauthorized**
  - Your access token may have expired
  - Clear credentials and re-authenticate

### General Issues

- Check browser console for JavaScript errors
- Verify all API routes are accessible
- Check Vercel deployment logs for server-side errors

## Custom Domain Setup (Optional)

1. In Vercel Dashboard, go to your project
2. Navigate to Settings > Domains
3. Add your custom domain
4. Update DNS records as instructed
5. **Important**: After adding custom domain:
   - Update Zoho API Console redirect URI to use your custom domain
   - Re-enter credentials in the app with the new redirect URL

## Monitoring

- View deployment logs in Vercel Dashboard
- Monitor function execution in Vercel Analytics
- Check Zoho API usage in Zoho API Console

## Security Recommendations

- Never commit `.env` files with secrets
- Regularly rotate your Zoho API credentials
- Monitor API usage for suspicious activity
- Use Vercel's environment variables for any sensitive data in the future

## Next Steps

After successful deployment:

1. Test all functionality thoroughly
2. Share the URL with your team
3. Consider adding custom domain
4. Set up monitoring/alerting
5. Plan for future features and improvements
