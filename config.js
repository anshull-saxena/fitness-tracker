// Google Sheets API Configuration
const GOOGLE_SHEETS_CONFIG = {
    apiKey: 'YOUR_API_KEY',  // Replace with your actual API key
    clientId: 'YOUR_CLIENT_ID',  // Replace with your actual client ID 
    spreadsheetId: 'YOUR_SHEET_ID',  // Replace with your actual sheet ID
    range: 'Sheet1!A:H',
    discoveryDoc: 'https://sheets.googleapis.com/$discovery/rest?version=v4',
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
};

// Export the configuration
window.GOOGLE_SHEETS_CONFIG = GOOGLE_SHEETS_CONFIG;
