// Google Sheets API Configuration
// IMPORTANT: You must replace the placeholder values below with your actual Google API credentials
// Follow the instructions in deployment-guide.md to set up your Google Cloud project and get these values
const GOOGLE_SHEETS_CONFIG = {
    // Get from Google Cloud Console > API & Services > Credentials > API Keys
    apiKey: 'YOUR_API_KEY',  // ⚠️ REQUIRED: Replace with your actual API key
    
    // Get from Google Cloud Console > API & Services > Credentials > OAuth 2.0 Client IDs
    clientId: 'YOUR_CLIENT_ID',  // ⚠️ REQUIRED: Replace with your actual client ID 
    
    // Get from your Google Sheet URL: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
    spreadsheetId: 'YOUR_SHEET_ID',  // ⚠️ REQUIRED: Replace with your actual sheet ID
    
    // The range in your spreadsheet (Sheet name + column range)
    range: 'Sheet1!A:H',
    
    // Don't change these unless you know what you're doing
    discoveryDoc: 'https://sheets.googleapis.com/$discovery/rest?version=v4',
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
};

// Export the configuration
window.GOOGLE_SHEETS_CONFIG = GOOGLE_SHEETS_CONFIG;
