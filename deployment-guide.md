# Fitness Tracker Pro - Deployment & Google Sheets Integration Guide

## 🚀 Quick Start

Your fitness tracker web app is ready to deploy! This guide will help you set up Google Sheets integration and deploy to Vercel.

## 📊 Google Sheets Integration Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" and name it (e.g., "Fitness Tracker")
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API" and enable it

### Step 2: Create Service Account (Recommended for server-side)

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Name your service account and create
4. Generate a JSON key file and download it
5. Share your Google Sheet with the service account email

### Step 3: Alternative - OAuth 2.0 Setup (for client-side)

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Add your domain to "Authorized origins" (e.g., `https://your-app.vercel.app`)
5. Copy the Client ID for your app

### Step 4: Update Your Google Sheet

1. Create a new Google Sheet or use existing one
2. Set up columns exactly as shown:
   ```
   Date | Weight (kg) | Waist (inches) | Calories | Protein (g) | Training Notes | Mood/Energy | Phase
   ```
3. Get your Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
   ```

### Step 5: Configure the App

Update the Google Sheets configuration in your app:

```javascript
// In app.js, update the configuration
const GOOGLE_SHEETS_CONFIG = {
    apiKey: 'YOUR_API_KEY',
    clientId: 'YOUR_CLIENT_ID', 
    spreadsheetId: 'YOUR_SHEET_ID',
    range: 'Sheet1!A:H', // Adjust based on your sheet
    discoveryDoc: 'https://sheets.googleapis.com/$discovery/rest?version=v4',
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
};
```

## 🌐 Vercel Deployment

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial fitness tracker app"
   git remote add origin https://github.com/yourusername/fitness-tracker-pro.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com) and sign up
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it as a static site

3. **Configure Environment Variables:**
   - In Vercel dashboard, go to your project settings
   - Add environment variables for Google Sheets API keys:
     ```
     GOOGLE_SHEETS_API_KEY=your_api_key
     GOOGLE_CLIENT_ID=your_client_id
     GOOGLE_SHEET_ID=your_sheet_id
     ```

### Method 2: Direct Upload

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```
   
3. **Follow prompts:**
   - Confirm project name
   - Choose settings (usually defaults are fine)
   - Get your live URL!

## 📱 PWA Setup

Your app is already configured as a PWA! Users can:

1. **Install on Mobile:**
   - Open the app in mobile browser
   - Tap "Add to Home Screen" when prompted
   - App will work offline and feel like a native app

2. **Install on Desktop:**
   - Chrome/Edge will show install button in address bar
   - Click to install as desktop app

## 🔧 Configuration Options

### Environment Variables

Create a `.env` file (don't commit to git):

```env
GOOGLE_SHEETS_API_KEY=your_api_key_here
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_SHEET_ID=your_sheet_id_here
```

### Advanced Features

**Custom Domain:**
- In Vercel dashboard: Settings > Domains
- Add your custom domain and follow DNS setup

**Analytics:**
- Vercel provides built-in analytics
- Or integrate Google Analytics by adding tracking code

## 🛠️ Technical Implementation

### Google Sheets API Integration

The app uses the Google Sheets API v4 with these key functions:

```javascript
// Read data from sheet
async function readFromSheet() {
    const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Sheet1!A:H'
    });
    return response.result.values;
}

// Write data to sheet
async function writeToSheet(values) {
    await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: 'Sheet1!A:H',
        valueInputOption: 'RAW',
        resource: { values: [values] }
    });
}
```

### Offline Functionality

- Uses `localStorage` for offline data storage
- Service Worker caches app files
- Queues API requests when offline
- Auto-syncs when connection restored

### Data Structure

Each entry follows this format:
```javascript
{
    date: "2025-06-22",
    weight: 75.0,
    waist: 32.0, 
    calories: 2200,
    protein: 150,
    trainingNotes: "Chest and triceps workout",
    mood: "Good",
    phase: "Cutting"
}
```

## 🔒 Security Best Practices

1. **API Keys:**
   - Never commit API keys to git
   - Use environment variables
   - Restrict API key usage to your domain

2. **Sheet Permissions:**
   - Only share sheet with necessary accounts
   - Use service account for server-side access
   - Consider making sheet read-only except for your app

3. **Data Validation:**
   - Client-side validation is implemented
   - Consider server-side validation for production

## 🐛 Troubleshooting

**Common Issues:**

1. **"API not enabled" error:**
   - Ensure Google Sheets API is enabled in Cloud Console

2. **Permission denied:**
   - Check if sheet is shared with service account email
   - Verify API key restrictions

3. **CORS errors:**
   - Add your domain to authorized origins in OAuth settings

4. **Offline sync not working:**
   - Check browser developer tools for service worker status
   - Clear browser cache and reinstall PWA

## 📞 Support

For technical issues:
1. Check browser developer console for errors
2. Verify Google Sheets API quotas
3. Test API calls in Google API Explorer
4. Review Vercel deployment logs

## 🎯 Next Steps

1. **Test the deployment** with sample data
2. **Customize the UI** colors and branding
3. **Add more features** like:
   - Photo uploads for progress pics
   - Workout plan integration
   - Social sharing features
   - Export to PDF reports

Your fitness tracker is now ready to help track progress with beautiful visualizations and seamless Google Sheets integration!